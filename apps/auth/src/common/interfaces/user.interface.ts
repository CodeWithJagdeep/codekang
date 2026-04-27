import type { PlanTier } from './plan.interface';

export interface IUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'github' | 'local';
  providerId: string;
  // linked VCS providers
  githubUsername?: string;
  gitlabUsername?: string;
  bitbucketUsername?: string;
  organizationName?: string;
  plan: PlanTier;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISocialLoginResponse extends IAuthTokens {
  user: IUser;
  isNewUser: boolean;
}

export interface IJwtPayload {
  sub: string;
  email: string;
  plan: PlanTier;
  iat?: number;
  exp?: number;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
