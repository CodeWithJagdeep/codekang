import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { RefreshTokenBlacklist } from '../entities/refresh-token-blacklist.entity';
import { Otp } from '../entities/otp.entity';
import { UserSession } from '../entities/user-session.entity';
import { UserIntegration } from '../entities/user-integration.entity';
import { MailService } from './mail/mail.service';
import { RazorpayService } from './razorpay.service';

// ─── Shared mocks ─────────────────────────────────────────────────────────────

const mockUser = (): User =>
  ({
    id: 'user-uuid-1',
    email: 'dev@test.com',
    name: 'Dev User',
    avatar: 'https://avatar.url',
    provider: 'github',
    providerId: 'gh-123',
    githubUsername: 'devuser',
    githubAccessToken: 'gho_token',
    refreshToken: '',
    plan: 'free',
    creditsUsed: 0,
    creditsReset: new Date(Date.now() + 86400000 * 30),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as User;

const mockUserRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  increment: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  }),
});

const mockBlacklistRepo = () => ({
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn().mockImplementation((d) => d),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockGenericRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn().mockImplementation((d) => d),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn().mockReturnValue('signed-token'),
  verify: jest.fn(),
  decode: jest
    .fn()
    .mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 }),
});

const mockConfigService = () => ({
  get: jest.fn().mockReturnValue('15m'),
  getOrThrow: jest.fn().mockReturnValue('test-secret'),
});

const mockMailService = () => ({
  sendWelcomeEmail: jest.fn(),
  sendLoginEmail: jest.fn(),
  sendOtpEmail: jest.fn(),
});

const mockRazorpayService = () => ({
  createSubscription: jest.fn(),
  cancelSubscription: jest.fn(),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: ReturnType<typeof mockUserRepo>;
  let blacklistRepo: ReturnType<typeof mockBlacklistRepo>;
  let otpRepo: ReturnType<typeof mockGenericRepo>;
  let sessionRepo: ReturnType<typeof mockGenericRepo>;
  let integrationRepo: ReturnType<typeof mockGenericRepo>;
  let jwtService: ReturnType<typeof mockJwtService>;
  let mailService: ReturnType<typeof mockMailService>;
  let razorpayService: ReturnType<typeof mockRazorpayService>;

  beforeEach(async () => {
    userRepo = mockUserRepo();
    blacklistRepo = mockBlacklistRepo();
    otpRepo = mockGenericRepo();
    sessionRepo = mockGenericRepo();
    integrationRepo = mockGenericRepo();
    jwtService = mockJwtService();
    mailService = mockMailService();
    razorpayService = mockRazorpayService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        {
          provide: getRepositoryToken(RefreshTokenBlacklist),
          useValue: blacklistRepo,
        },
        { provide: getRepositoryToken(Otp), useValue: otpRepo },
        { provide: getRepositoryToken(UserSession), useValue: sessionRepo },
        {
          provide: getRepositoryToken(UserIntegration),
          useValue: integrationRepo,
        },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useFactory: mockConfigService },
        { provide: MailService, useValue: mailService },
        { provide: RazorpayService, useValue: razorpayService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  // ── findOrCreateUser ───────────────────────────────────────────────────────

  describe('findOrCreateUser', () => {
    it('creates a new user when none exists', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const created = mockUser();
      userRepo.create.mockReturnValue(created);
      userRepo.save.mockResolvedValue(created);
      userRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(created);

      const result = await service.findOrCreateUser({
        provider: 'github',
        providerId: 'gh-123',
        email: 'dev@test.com',
        name: 'Dev User',
        githubUsername: 'devuser',
        githubAccessToken: 'gho_token',
      });

      expect(userRepo.create).toHaveBeenCalled();
      expect(userRepo.save).toHaveBeenCalled();
      expect(result.email).toBe('dev@test.com');
    });

    it('returns existing user and updates access token', async () => {
      const existing = mockUser();
      userRepo.findOne
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(existing);
      userRepo.save.mockResolvedValue(existing);

      const result = await service.findOrCreateUser({
        provider: 'github',
        providerId: 'gh-123',
        email: 'dev@test.com',
        name: 'Updated Name',
        githubAccessToken: 'new_token',
      });

      expect(userRepo.create).not.toHaveBeenCalled();
      expect(result.githubAccessToken).toBe('new_token');
    });
  });

  // ── generateTokens ─────────────────────────────────────────────────────────

  describe('generateTokens', () => {
    it('returns access and refresh tokens with expiresIn', () => {
      const user = mockUser();
      const tokens = service.generateTokens(user);

      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(tokens).toMatchObject({
        accessToken: 'signed-token',
        refreshToken: 'signed-token',
        expiresIn: 3600,
      });
    });
  });

  // ── validateToken ──────────────────────────────────────────────────────────

  describe('validateToken', () => {
    it('returns public user for valid token', async () => {
      const user = mockUser();
      jwtService.verify.mockReturnValue({
        sub: user.id,
        email: user.email,
        plan: 'free',
      });
      userRepo.findOne.mockResolvedValue(user);

      const result = await service.validateToken('valid-token');

      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect((result as any).githubAccessToken).toBeUndefined();
    });

    it('throws UnauthorizedException when user not found', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'bad-id',
        email: 'x@y.com',
        plan: 'free',
      });
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.validateToken('some-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException on invalid token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.validateToken('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ── refreshTokens ──────────────────────────────────────────────────────────

  describe('refreshTokens', () => {
    it('rotates refresh token and returns new tokens', async () => {
      const user = mockUser();
      jwtService.verify.mockReturnValue({
        sub: user.id,
        email: user.email,
        plan: 'free',
      });
      blacklistRepo.findOne.mockResolvedValue(null);
      userRepo.findOne.mockResolvedValue(user);
      blacklistRepo.create.mockImplementation((d) => d);
      blacklistRepo.save.mockResolvedValue({});

      const result = await service.refreshTokens('valid-refresh');

      expect(blacklistRepo.save).toHaveBeenCalled();
      expect(result.accessToken).toBe('signed-token');
    });

    it('rejects blacklisted refresh token', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'uid',
        email: 'e@x.com',
        plan: 'free',
      });
      blacklistRepo.findOne.mockResolvedValue({ tokenHash: 'hashed' });

      await expect(service.refreshTokens('blacklisted-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ── checkCredits ───────────────────────────────────────────────────────────

  describe('checkCredits', () => {
    it('allows when credits are available', async () => {
      const user = { ...mockUser(), plan: 'pro' as const, creditsUsed: 10 };
      userRepo.findOne.mockResolvedValue(user);

      const result = await service.checkCredits(user.id, 1);

      expect(result.allowed).toBe(true);
      expect(result.creditsRemaining).toBe(1489); // 1500 - 10 - 1
    });

    it('blocks when credits exhausted', async () => {
      const user = { ...mockUser(), plan: 'free' as const, creditsUsed: 50 };
      userRepo.findOne.mockResolvedValue(user);

      const result = await service.checkCredits(user.id, 1);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Insufficient credits');
    });

    it('always allows for team/enterprise (unlimited)', async () => {
      const user = { ...mockUser(), plan: 'team' as const, creditsUsed: 99999 };
      userRepo.findOne.mockResolvedValue(user);

      const result = await service.checkCredits(user.id, 100);

      expect(result.allowed).toBe(true);
      expect(result.creditsRemaining).toBe(-1);
    });

    it('resets credits when monthly reset date has passed', async () => {
      const user = {
        ...mockUser(),
        plan: 'starter' as const,
        creditsUsed: 400,
        creditsReset: new Date(Date.now() - 86400000), // yesterday
      };
      userRepo.findOne.mockResolvedValue(user);
      userRepo.save.mockResolvedValue({ ...user, creditsUsed: 0 });

      const result = await service.checkCredits(user.id, 1);

      expect(userRepo.save).toHaveBeenCalled();
      expect(result.allowed).toBe(true);
    });

    it('returns not found when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);

      const result = await service.checkCredits('bad-id', 1);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('User not found');
    });
  });

  // ── consumeCredits ─────────────────────────────────────────────────────────

  describe('consumeCredits', () => {
    it('increments credits_used for metered plans', async () => {
      const user = { ...mockUser(), plan: 'pro' as const };
      userRepo.findOne.mockResolvedValue(user);

      await service.consumeCredits(user.id, 10);

      expect(userRepo.increment).toHaveBeenCalledWith(
        { id: user.id },
        'creditsUsed',
        10,
      );
    });

    it('skips increment for unlimited plans', async () => {
      const user = { ...mockUser(), plan: 'enterprise' as const };
      userRepo.findOne.mockResolvedValue(user);

      await service.consumeCredits(user.id, 10);

      expect(userRepo.increment).not.toHaveBeenCalled();
    });
  });

  // ── getSubscription ────────────────────────────────────────────────────────

  describe('getSubscription', () => {
    it('returns subscription with correct tier and usage', async () => {
      const user = { ...mockUser(), plan: 'pro' as const, creditsUsed: 100 };
      userRepo.findOne.mockResolvedValue(user);
      userRepo.save.mockResolvedValue(user);

      const sub = await service.getSubscription(user.id);

      expect(sub.tier).toBe('pro');
      expect(sub.creditsUsed).toBe(100);
      expect(sub.isActive).toBe(true);
    });
  });

  // ── logout ─────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('clears refresh token on logout', async () => {
      const user = mockUser();
      userRepo.update.mockResolvedValue({});

      await service.logout(user.id);

      expect(userRepo.update).toHaveBeenCalledWith(user.id, {
        refreshToken: '',
      });
    });
  });
});
