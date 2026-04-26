import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { createHash } from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../entities/user.entity';
import { RefreshTokenBlacklist } from '../entities/refresh-token-blacklist.entity';
import { Otp } from '../entities/otp.entity';
import { UserSession } from '../entities/user-session.entity';
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
import { RazorpayService, type RazorpaySubscriptionResult } from './razorpay.service';
import * as UAParser from 'ua-parser-js';

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
  private readonly logger = new Logger(AuthService.name);
  private readonly googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshTokenBlacklist)
    private readonly blacklistRepo: Repository<RefreshTokenBlacklist>,
    @InjectRepository(Otp) private readonly otpRepo: Repository<Otp>,
    @InjectRepository(UserSession) private readonly sessionRepo: Repository<UserSession>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
    private readonly razorpayService: RazorpayService,
  ) {
    this.googleClient = new OAuth2Client(this.config.get('GOOGLE_CLIENT_ID'));
  }

  // ─── Social login (Google + GitHub) ─────────────────────────────────────

  async socialLogin(
    provider: 'google' | 'github',
    token: string,
    ip?: string,
    userAgent?: string,
  ): Promise<ISocialLoginResponse> {
    this.logger.log(`socialLogin verifying token provider=${provider}`);
    const profile =
      provider === 'google'
        ? await this.verifyGoogleToken(token)
        : await this.verifyGithubToken(token);

    this.logger.log(`socialLogin profile resolved email=${profile.email} provider=${provider}`);
    return this.loginWithProfile(profile, ip, userAgent);
  }

  private async verifyGoogleToken(idToken: string): Promise<OAuthProfile> {
    const clientId = this.config.get('GOOGLE_CLIENT_ID');
    if (!clientId) {
      this.logger.error('verifyGoogleToken: GOOGLE_CLIENT_ID is not configured');
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

      this.logger.log(`verifyGoogleToken success email=${p.email}`);
      return {
        provider: 'google',
        providerId: p.sub,
        email: p.email,
        name: p.name ?? p.email.split('@')[0],
        avatar: p.picture,
      };
    } catch (err) {
      this.logger.error('verifyGoogleToken failed', err instanceof Error ? err.stack : String(err));
      throw new UnauthorizedException('Invalid Google ID token');
    }
  }

  private async verifyGithubToken(accessToken: string): Promise<OAuthProfile> {
    this.logger.log('verifyGithubToken calling GitHub API');
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
      this.logger.error(`verifyGithubToken failed status=${userResp.status}`);
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

    this.logger.log(`verifyGithubToken success login=${ghUser.login}`);
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

  async exchangeGithubCode(code: string, redirectUri?: string): Promise<string> {
    this.logger.log(`exchangeGithubCode calling GitHub OAuth endpoint redirectUri=${redirectUri}`);
    const clientId = this.config.get('GITHUB_CLIENT_ID');
    const clientSecret = this.config.get('GITHUB_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      this.logger.error('exchangeGithubCode: GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is not configured');
      throw new Error('GitHub OAuth is not configured on this server');
    }

    const body: Record<string, string> = {
      client_id: clientId,
      client_secret: clientSecret,
      code,
    };
    if (redirectUri) body.redirect_uri = redirectUri;

    const resp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const rawBody = await resp.text().catch(() => '');
      this.logger.error(`exchangeGithubCode failed status=${resp.status} body=${rawBody}`);
      throw new UnauthorizedException('Failed to exchange GitHub code');
    }

    const data = (await resp.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (data.error) {
      this.logger.error(`exchangeGithubCode error=${data.error} desc=${data.error_description}`);
      throw new UnauthorizedException(data.error_description || data.error);
    }

    if (!data.access_token) {
      this.logger.error('exchangeGithubCode: no access_token in response');
      throw new UnauthorizedException('No access token returned from GitHub');
    }

    return data.access_token;
  }

  private async loginWithProfile(
    profile: OAuthProfile,
    ip?: string,
    userAgent?: string,
  ): Promise<ISocialLoginResponse> {
    let user = await this.userRepo.findOne({
      where: { provider: profile.provider, providerId: profile.providerId },
    });

    if (!user) {
      user = await this.userRepo.findOne({ where: { email: profile.email } });
    }

    const isNewUser = !user;

    if (!user) {
      this.logger.log(`loginWithProfile new user email=${profile.email} provider=${profile.provider}`);
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
      this.logger.log(`loginWithProfile user created id=${user.id}`);
      void this.mailService.sendWelcomeEmail({
        email: user.email,
        name: user.name,
      });
    } else {
      this.logger.log(`loginWithProfile returning user id=${user.id} provider=${profile.provider}`);
      user.provider = profile.provider;
      user.providerId = profile.providerId;
      user.name = profile.name;
      if (profile.avatar) user.avatar = profile.avatar;
      if (profile.githubUsername) user.githubUsername = profile.githubUsername;
      if (profile.githubAccessToken)
        user.githubAccessToken = profile.githubAccessToken;
      await this.userRepo.save(user);
      void this.mailService.sendLoginEmail({
        email: user.email,
        name: user.name,
      });
    }

    const tokens = this.generateTokens(user);
    if (ip && userAgent) {
      await this.trackSession(user.id, ip, userAgent);
    }
    return { ...tokens, user: this.toPublicUser(user), isNewUser };
  }

  async findOrCreateUser(profile: OAuthProfile): Promise<User> {
    const result = await this.loginWithProfile(profile, '', '');
    const user = await this.userRepo.findOne({
      where: { id: result.user.id },
    });
    return user!;
  }

  // ─── Email OTP Authentication ─────────────────────────────────────────────────

  async sendOtp(email: string): Promise<void> {
    this.logger.log(`sendOtp generating code email=${email}`);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    let otp = await this.otpRepo.findOne({ where: { email } });
    if (otp) {
      this.logger.log(`sendOtp refreshing existing OTP email=${email}`);
      otp.code = code;
      otp.expiresAt = expiresAt;
    } else {
      this.logger.log(`sendOtp creating new OTP email=${email}`);
      otp = this.otpRepo.create({ email, code, expiresAt });
    }
    await this.otpRepo.save(otp);

    await this.mailService.sendOtpEmail(email, code);
    this.logger.log(`sendOtp email sent email=${email}`);
  }

  async verifyOtp(email: string, code: string, ip?: string, userAgent?: string): Promise<ISocialLoginResponse> {
    this.logger.log(`verifyOtp email=${email}`);
    const otp = await this.otpRepo.findOne({ where: { email } });
    if (!otp) {
      this.logger.warn(`verifyOtp no OTP record found email=${email}`);
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    if (otp.code !== code) {
      this.logger.warn(`verifyOtp invalid code email=${email}`);
      throw new UnauthorizedException('Invalid OTP code');
    }
    if (otp.expiresAt < new Date()) {
      this.logger.warn(`verifyOtp expired OTP email=${email}`);
      throw new UnauthorizedException('OTP has expired');
    }

    await this.otpRepo.remove(otp);
    this.logger.log(`verifyOtp code accepted email=${email}`);

    let user = await this.userRepo.findOne({ where: { email } });
    const isNewUser = !user;

    if (!user) {
      this.logger.log(`verifyOtp new user email=${email}`);
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
      this.logger.log(`verifyOtp user created id=${user.id}`);
      void this.mailService.sendWelcomeEmail({
        email: user.email,
        name: user.name,
      });
    } else {
      this.logger.log(`verifyOtp returning user id=${user.id}`);
      void this.mailService.sendLoginEmail({
        email: user.email,
        name: user.name,
      });
    }

    const tokens = this.generateTokens(user);
    if (ip && userAgent) {
      await this.trackSession(user.id, ip, userAgent);
    }
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
    return { accessToken, refreshToken, expiresIn: 3600 };
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
      if (!user) {
        this.logger.warn(`validateToken user not found or deactivated userId=${payload.sub}`);
        throw new UnauthorizedException('User not found or deactivated');
      }
      this.logger.log(`validateToken success userId=${user.id}`);
      return this.toPublicUser(user);
    } catch (err) {
      if (!(err instanceof UnauthorizedException)) {
        this.logger.warn(`validateToken invalid token: ${err instanceof Error ? err.message : String(err)}`);
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async refreshTokens(refreshToken: string): Promise<IAuthTokens> {
    this.logger.log('refreshTokens verifying token');
    let payload: { sub: string; email: string; plan: PlanTier };
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch (err) {
      this.logger.warn(`refreshTokens invalid token: ${err instanceof Error ? err.message : String(err)}`);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = this.hashToken(refreshToken);
    const blacklisted = await this.blacklistRepo.findOne({
      where: { tokenHash },
    });
    if (blacklisted) {
      this.logger.warn(`refreshTokens revoked token userId=${payload.sub}`);
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    const user = await this.userRepo.findOne({
      where: { id: payload.sub, isActive: true },
    });
    if (!user) {
      this.logger.warn(`refreshTokens user not found userId=${payload.sub}`);
      throw new UnauthorizedException('User not found');
    }

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

    this.logger.log(`refreshTokens success userId=${user.id}`);
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
    this.logger.log(`logout userId=${userId}`);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    await this.userRepo.update(userId, { refreshToken: '' });
    if (user) {
      this.logger.log(`logout session cleared userId=${userId}`);
      void this.mailService.sendLogoutEmail({
        email: user.email,
        name: user.name,
      });
    } else {
      this.logger.warn(`logout user not found userId=${userId}`);
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
    provider: 'github' | 'gitlab' | 'bitbucket',
    token: string,
  ): Promise<IUser> {
    this.logger.log(`linkVcs userId=${userId} provider=${provider}`);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`linkVcs user not found userId=${userId}`);
      throw new UnauthorizedException('User not found');
    }

    if (provider === 'github') {
      this.logger.log(`linkVcs verifying GitHub token userId=${userId}`);
      const profile = await this.verifyGithubToken(token);
      user.githubUsername = profile.githubUsername ?? profile.name;
      user.githubAccessToken = profile.githubAccessToken ?? token;
      this.logger.log(`linkVcs GitHub linked userId=${userId} username=${user.githubUsername}`);
    } else if (provider === 'gitlab') {
      this.logger.log(`linkVcs verifying GitLab token userId=${userId}`);
      const resp = await fetch('https://gitlab.com/api/v4/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        this.logger.error(`linkVcs invalid GitLab token userId=${userId} status=${resp.status}`);
        throw new UnauthorizedException('Invalid GitLab token');
      }
      const gl = (await resp.json()) as { username: string };
      user.gitlabUsername = gl.username;
      user.gitlabAccessToken = token;
      this.logger.log(`linkVcs GitLab linked userId=${userId} username=${gl.username}`);
    } else if (provider === 'bitbucket') {
      this.logger.log(`linkVcs verifying Bitbucket token userId=${userId}`);
      const resp = await fetch('https://api.bitbucket.org/2.0/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        this.logger.error(`linkVcs invalid Bitbucket token userId=${userId} status=${resp.status}`);
        throw new UnauthorizedException('Invalid Bitbucket token');
      }
      const bb = (await resp.json()) as { nickname: string };
      user.bitbucketUsername = bb.nickname;
      user.bitbucketAccessToken = token;
      this.logger.log(`linkVcs Bitbucket linked userId=${userId} username=${bb.nickname}`);
    }

    await this.userRepo.save(user);
    return this.toPublicUser(user);
  }

  async updatePlan(userId: string, plan: PlanTier): Promise<IUser> {
    this.logger.log(`updatePlan userId=${userId} plan=${plan}`);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`updatePlan user not found userId=${userId}`);
      throw new UnauthorizedException('User not found');
    }

    const previousPlan = user.plan;
    this.logger.log(`updatePlan userId=${userId} previousPlan=${previousPlan} newPlan=${plan}`);
    user.plan = plan;
    // Reset credits on plan change
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
    user.creditsUsed = 0;
    user.creditsReset = nextMonth;
    await this.userRepo.save(user);

    // Only send purchase/payment emails when upgrading (not on free plan)
    if (plan !== 'free' && plan !== previousPlan) {
      this.logger.log(`updatePlan sending billing emails userId=${userId} plan=${plan}`);
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

    this.logger.log(`updatePlan success userId=${userId} plan=${plan}`);
    return this.toPublicUser(user);
  }

  async createRazorpaySubscription(
    userId: string,
    planTier: 'starter' | 'team',
    billingPeriod: 'monthly' | 'annual' = 'monthly',
  ): Promise<RazorpaySubscriptionResult> {
    this.logger.log(`createRazorpaySubscription userId=${userId} planTier=${planTier} billingPeriod=${billingPeriod}`);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    // Cancel existing subscription if there is one
    if (user.razorpaySubscriptionId) {
      await this.razorpayService
        .cancelSubscription(user.razorpaySubscriptionId)
        .catch((err) => this.logger.warn(`Failed to cancel old subscription: ${(err as Error).message}`));
    }

    const result = await this.razorpayService.createSubscription(userId, planTier, billingPeriod);

    // Persist the new subscription ID
    await this.userRepo.update(userId, { razorpaySubscriptionId: result.subscriptionId });
    this.logger.log(`createRazorpaySubscription saved subscriptionId=${result.subscriptionId}`);

    return result;
  }

  async cancelRazorpaySubscription(userId: string): Promise<IUser> {
    this.logger.log(`cancelRazorpaySubscription userId=${userId}`);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    if (user.razorpaySubscriptionId) {
      await this.razorpayService
        .cancelSubscription(user.razorpaySubscriptionId)
        .catch((err) => this.logger.warn(`Razorpay cancel error: ${(err as Error).message}`));
    }

    user.plan = 'free';
    user.razorpaySubscriptionId = null;
    user.creditsUsed = 0;
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
    user.creditsReset = nextMonth;
    await this.userRepo.save(user);

    this.logger.log(`cancelRazorpaySubscription plan reset to free userId=${userId}`);
    return this.toPublicUser(user);
  }

  async completeOnboarding(userId: string): Promise<IUser> {
    this.logger.log(`completeOnboarding userId=${userId}`);
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`completeOnboarding user not found userId=${userId}`);
      throw new UnauthorizedException('User not found');
    }
    user.onboardingCompleted = true;
    await this.userRepo.save(user);
    this.logger.log(`completeOnboarding success userId=${userId}`);
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

  // ─── Session Management ───────────────────────────────────────────────────────

  private async trackSession(userId: string, ip: string, userAgent: string) {
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();

    const deviceStr = browser.name ? `${browser.name} on ${os.name || 'Unknown'}` : 'Unknown Device';
    const osStr = os.name || 'Unknown';

    // Basic heuristic: check if session already exists for this IP and UA to avoid spamming
    const existing = await this.sessionRepo.findOne({
      where: { userId, ip, device: deviceStr, isValid: true }
    });

    if (existing) {
      existing.lastActive = new Date();
      await this.sessionRepo.save(existing);
    } else {
      const session = this.sessionRepo.create({
        userId,
        ip,
        device: deviceStr,
        os: osStr,
        location: 'Unknown', // Could use geo-ip later
        lastActive: new Date(),
      });
      await this.sessionRepo.save(session);
    }
  }

  async getSessions(userId: string) {
    return this.sessionRepo.find({
      where: { userId, isValid: true },
      order: { lastActive: 'DESC' },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.sessionRepo.update({ id: sessionId, userId }, { isValid: false });
  }
}
