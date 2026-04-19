import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { createHash } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../entities/user.entity';
import { RefreshTokenBlacklist } from '../entities/refresh-token-blacklist.entity';
import { Otp } from '../entities/otp.entity';
import { PLANS } from '../common';
import type {
  IAuthTokens,
  IUser,
  ISubscription,
  IUsageCheck,
  PlanTier,
  ISocialLoginResponse,
} from '../common';
import { MailService } from './mail/mail.service';

interface OAuthProfile {
  provider: 'google' | 'github';
  providerId: string;
  email: string;
  name: string;
  avatar?: string;
  githubUsername?: string;
  githubAccessToken?: string;
}

// Credits threshold (%) below which a pending-billing email is sent
const LOW_CREDITS_THRESHOLD = 0.1;

// Plan display prices (used in billing emails)
const PLAN_PRICES: Record<string, string> = {
  free: '$0',
  starter: '$15',
  pro: '$29',
  team: '$249',
  enterprise: 'Custom',
};

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshTokenBlacklist)
    private readonly blacklistRepo: Repository<RefreshTokenBlacklist>,
    @InjectRepository(Otp) private readonly otpRepo: Repository<Otp>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {
    this.googleClient = new OAuth2Client(this.config.get('GOOGLE_CLIENT_ID'));
  }

  // ─── Social login (Google + GitHub) ─────────────────────────────────────

  async socialLogin(
    provider: 'google' | 'github',
    token: string,
  ): Promise<ISocialLoginResponse> {
    const profile =
      provider === 'google'
        ? await this.verifyGoogleToken(token)
        : await this.verifyGithubToken(token);

    return this.loginWithProfile(profile);
  }

  private async verifyGoogleToken(idToken: string): Promise<OAuthProfile> {
    const clientId = this.config.get('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new UnauthorizedException(
        'Google OAuth is not configured on this server',
      );
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: clientId,
      });
      const p = ticket.getPayload();
      if (!p?.email) throw new Error('No email in token');

      return {
        provider: 'google',
        providerId: p.sub,
        email: p.email,
        name: p.name ?? p.email.split('@')[0],
        avatar: p.picture,
      };
    } catch {
      throw new UnauthorizedException('Invalid Google ID token');
    }
  }

  private async verifyGithubToken(accessToken: string): Promise<OAuthProfile> {
    const [userResp, emailsResp] = await Promise.all([
      fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      }),
      fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      }),
    ]);

    if (!userResp.ok) {
      throw new UnauthorizedException('Invalid GitHub access token');
    }

    const ghUser = (await userResp.json()) as {
      id: number;
      login: string;
      name: string | null;
      email: string | null;
      avatar_url: string;
    };

    let email = ghUser.email;
    if (!email && emailsResp.ok) {
      const emails = (await emailsResp.json()) as {
        email: string;
        primary: boolean;
        verified: boolean;
      }[];
      email =
        emails.find((e) => e.primary && e.verified)?.email ??
        emails.find((e) => e.verified)?.email ??
        `${ghUser.login}@users.noreply.github.com`;
    }

    return {
      provider: 'github',
      providerId: String(ghUser.id),
      email: email ?? `${ghUser.login}@users.noreply.github.com`,
      name: ghUser.name ?? ghUser.login,
      avatar: ghUser.avatar_url,
      githubUsername: ghUser.login,
      githubAccessToken: accessToken,
    };
  }

  private async loginWithProfile(
    profile: OAuthProfile,
  ): Promise<ISocialLoginResponse> {
    let user = await this.userRepo.findOne({
      where: { provider: profile.provider, providerId: profile.providerId },
    });

    if (!user) {
      user = await this.userRepo.findOne({ where: { email: profile.email } });
    }

    const isNewUser = !user;

    if (!user) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
      user = this.userRepo.create({
        ...profile,
        plan: 'free',
        creditsUsed: 0,
        creditsReset: nextMonth,
        isActive: true,
        onboardingCompleted: false,
      });
      await this.userRepo.save(user);
      // Fire-and-forget: welcome email for brand-new users
      void this.mailService.sendWelcomeEmail({
        email: user.email,
        name: user.name,
      });
    } else {
      user.provider = profile.provider;
      user.providerId = profile.providerId;
      user.name = profile.name;
      if (profile.avatar) user.avatar = profile.avatar;
      if (profile.githubUsername) user.githubUsername = profile.githubUsername;
      if (profile.githubAccessToken)
        user.githubAccessToken = profile.githubAccessToken;
      await this.userRepo.save(user);
      // Fire-and-forget: login notification for returning users
      void this.mailService.sendLoginEmail({
        email: user.email,
        name: user.name,
      });
    }

    const tokens = this.generateTokens(user);
    return { ...tokens, user: this.toPublicUser(user), isNewUser };
  }

  async findOrCreateUser(profile: OAuthProfile): Promise<User> {
    const result = await this.loginWithProfile(profile);
    const user = await this.userRepo.findOne({
      where: { id: result.user.id },
    });
    return user!;
  }

  // ─── Email OTP Authentication ─────────────────────────────────────────────────

  async sendOtp(email: string): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutes expiry

    let otp = await this.otpRepo.findOne({ where: { email } });
    if (otp) {
      otp.code = code;
      otp.expiresAt = expiresAt;
    } else {
      otp = this.otpRepo.create({ email, code, expiresAt });
    }
    await this.otpRepo.save(otp);

    await this.mailService.sendOtpEmail(email, code);
  }

  async verifyOtp(email: string, code: string): Promise<ISocialLoginResponse> {
    const otp = await this.otpRepo.findOne({ where: { email } });
    if (!otp) throw new UnauthorizedException('Invalid or expired OTP');
    if (otp.code !== code) throw new UnauthorizedException('Invalid OTP code');
    if (otp.expiresAt < new Date())
      throw new UnauthorizedException('OTP has expired');

    // Remove OTP after successful code entry
    await this.otpRepo.remove(otp);

    let user = await this.userRepo.findOne({ where: { email } });
    const isNewUser = !user;

    if (!user) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
      user = this.userRepo.create({
        email,
        name: email.split('@')[0],
        provider: 'local',
        providerId: email,
        plan: 'free',
        creditsUsed: 0,
        creditsReset: nextMonth,
        isActive: true,
        onboardingCompleted: false,
      });
      await this.userRepo.save(user);
      void this.mailService.sendWelcomeEmail({
        email: user.email,
        name: user.name,
      });
    } else {
      void this.mailService.sendLoginEmail({
        email: user.email,
        name: user.name,
      });
    }

    const tokens = this.generateTokens(user);
    return { ...tokens, user: this.toPublicUser(user), isNewUser };
  }

  // ─── Token management ─────────────────────────────────────────────────────────

  generateTokens(user: User): IAuthTokens {
    const payload = { sub: user.id, email: user.email, plan: user.plan };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
    return { accessToken, refreshToken, expiresIn: 900 };
  }

  async validateToken(token: string): Promise<IUser> {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        plan: PlanTier;
      }>(token);
      const user = await this.userRepo.findOne({
        where: { id: payload.sub, isActive: true },
      });
      if (!user)
        throw new UnauthorizedException('User not found or deactivated');
      return this.toPublicUser(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async refreshTokens(refreshToken: string): Promise<IAuthTokens> {
    let payload: { sub: string; email: string; plan: PlanTier };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = this.hashToken(refreshToken);
    const blacklisted = await this.blacklistRepo.findOne({
      where: { tokenHash },
    });
    if (blacklisted)
      throw new UnauthorizedException('Refresh token has been revoked');

    const user = await this.userRepo.findOne({
      where: { id: payload.sub, isActive: true },
    });
    if (!user) throw new UnauthorizedException('User not found');

    const decoded = this.jwtService.decode(refreshToken);
    if (decoded?.exp) {
      await this.blacklistRepo.save(
        this.blacklistRepo.create({
          tokenHash,
          userId: user.id,
          expiresAt: new Date(decoded.exp * 1000),
        }),
      );
    }

    return this.generateTokens(user);
  }

  async getUser(userId: string): Promise<IUser> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return this.toPublicUser(user);
  }

  async getGithubToken(userId: string): Promise<string | null> {
    const user = await this.userRepo
      .createQueryBuilder('u')
      .addSelect('u.githubAccessToken')
      .where('u.id = :id', { id: userId })
      .getOne();
    return user?.githubAccessToken ?? null;
  }

  async logout(userId: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    await this.userRepo.update(userId, { refreshToken: '' });
    if (user) {
      void this.mailService.sendLogoutEmail({
        email: user.email,
        name: user.name,
      });
    }
  }

  async getSubscription(userId: string): Promise<ISubscription> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const now = new Date();
    if (!user.creditsReset || user.creditsReset < now) {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      user.creditsUsed = 0;
      user.creditsReset = nextMonth;
      await this.userRepo.save(user);
    }

    return {
      id: user.id,
      userId: user.id,
      tier: user.plan,
      creditsUsed: user.creditsUsed,
      creditsReset: user.creditsReset,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async checkCredits(userId: string, cost: number): Promise<IUsageCheck> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user)
      return { allowed: false, creditsRemaining: 0, reason: 'User not found' };

    const plan = PLANS[user.plan];
    if (plan.features.creditsPerMonth === -1)
      return { allowed: true, creditsRemaining: -1 };

    const now = new Date();
    if (!user.creditsReset || user.creditsReset < now) {
      user.creditsUsed = 0;
      user.creditsReset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      await this.userRepo.save(user);
    }

    const remaining = plan.features.creditsPerMonth - user.creditsUsed;
    if (remaining < cost) {
      const upgradeTip =
        user.plan === 'free'
          ? 'Upgrade to Starter ($15/mo) for 400 credits/month.'
          : user.plan === 'starter'
            ? 'Upgrade to Pro ($29/mo) for 1,500 credits/month.'
            : user.plan === 'pro'
              ? 'Upgrade to Team ($249/mo) for unlimited credits.'
              : 'Contact us to increase your limit.';
      return {
        allowed: false,
        creditsRemaining: Math.max(remaining, 0),
        reason: `Insufficient credits. You have ${Math.max(remaining, 0)} left this month. ${upgradeTip}`,
      };
    }

    return { allowed: true, creditsRemaining: remaining - cost };
  }

  async consumeCredits(userId: string, cost: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return;
    const plan = PLANS[user.plan];
    if (plan.features.creditsPerMonth === -1) return;

    await this.userRepo.increment({ id: userId }, 'creditsUsed', cost);

    // Send low-credits warning when user crosses the threshold
    const totalCredits = plan.features.creditsPerMonth;
    const usedAfter = user.creditsUsed + cost;
    const remainingAfter = totalCredits - usedAfter;
    const threshold = Math.ceil(totalCredits * LOW_CREDITS_THRESHOLD);
    const wasAbove = totalCredits - user.creditsUsed > threshold;
    const nowBelow = remainingAfter <= threshold;
    if (wasAbove && nowBelow) {
      void this.mailService.sendPendingBillingEmail(
        { email: user.email, name: user.name },
        remainingAfter,
        user.plan,
      );
    }
  }

  async cleanExpiredBlacklist(): Promise<void> {
    await this.blacklistRepo.delete({ expiresAt: LessThan(new Date()) });
  }

  async linkVcs(
    userId: string,
    provider: 'gitlab' | 'bitbucket',
    token: string,
  ): Promise<IUser> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    if (provider === 'gitlab') {
      const resp = await fetch('https://gitlab.com/api/v4/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new UnauthorizedException('Invalid GitLab token');
      const gl = (await resp.json()) as { username: string };
      user.gitlabUsername = gl.username;
      user.gitlabAccessToken = token;
    } else {
      const resp = await fetch('https://api.bitbucket.org/2.0/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new UnauthorizedException('Invalid Bitbucket token');
      const bb = (await resp.json()) as { nickname: string };
      user.bitbucketUsername = bb.nickname;
      user.bitbucketAccessToken = token;
    }

    await this.userRepo.save(user);
    return this.toPublicUser(user);
  }

  async updatePlan(userId: string, plan: PlanTier): Promise<IUser> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const previousPlan = user.plan;
    user.plan = plan;
    // Reset credits on plan change
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
    user.creditsUsed = 0;
    user.creditsReset = nextMonth;
    await this.userRepo.save(user);

    // Only send purchase/payment emails when upgrading (not on free plan)
    if (plan !== 'free' && plan !== previousPlan) {
      const price = PLAN_PRICES[plan] ?? 'Custom';
      const invoiceId = `INV-${Date.now()}`;
      const date = new Date().toDateString();
      const recipient = { email: user.email, name: user.name };

      void Promise.all([
        this.mailService.sendPurchaseEmail(recipient, plan, price),
        this.mailService.sendInvoiceEmail(
          recipient,
          plan,
          price,
          invoiceId,
          date,
        ),
        this.mailService.sendPaymentCompleteEmail(recipient, plan, price),
      ]);
    }

    return this.toPublicUser(user);
  }

  async completeOnboarding(userId: string): Promise<IUser> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    user.onboardingCompleted = true;
    await this.userRepo.save(user);
    return this.toPublicUser(user);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private toPublicUser(user: User): IUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: user.provider,
      providerId: user.providerId,
      githubUsername: user.githubUsername ?? undefined,
      gitlabUsername: user.gitlabUsername ?? undefined,
      bitbucketUsername: user.bitbucketUsername ?? undefined,
      plan: user.plan,
      onboardingCompleted: user.onboardingCompleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
