import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { PlanTier } from '../common';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'varchar', default: 'github' })
  provider: 'google' | 'github' | 'local';

  @Index()
  @Column({ name: 'provider_id' })
  providerId: string;

  // ─── GitHub ───────────────────────────────────────────────────────────────
  @Column({ name: 'github_username', nullable: true })
  githubUsername: string;

  @Column({ name: 'github_access_token', nullable: true, type: 'text', select: false })
  githubAccessToken: string;

  // ─── GitLab ───────────────────────────────────────────────────────────────
  @Column({ name: 'gitlab_username', nullable: true })
  gitlabUsername: string;

  @Column({ name: 'gitlab_access_token', nullable: true, type: 'text', select: false })
  gitlabAccessToken: string;

  // ─── Bitbucket ────────────────────────────────────────────────────────────
  @Column({ name: 'bitbucket_username', nullable: true })
  bitbucketUsername: string;

  @Column({ name: 'bitbucket_access_token', nullable: true, type: 'text', select: false })
  bitbucketAccessToken: string;

  // ─── Auth ─────────────────────────────────────────────────────────────────
  @Column({ name: 'refresh_token', nullable: true, type: 'text', select: false })
  refreshToken: string;

  // ─── Plan & credits ───────────────────────────────────────────────────────
  @Column({ type: 'varchar', default: 'free', enum: ['free', 'starter', 'pro', 'team', 'enterprise'] })
  plan: PlanTier;

  @Column({ name: 'credits_used', type: 'int', default: 0 })
  creditsUsed: number;

  @Column({ name: 'credits_reset', type: 'timestamptz', nullable: true })
  creditsReset: Date;

  // ─── Stripe billing ───────────────────────────────────────────────────────
  @Column({ name: 'stripe_customer_id', nullable: true })
  stripeCustomerId: string;

  @Column({ name: 'stripe_subscription_id', nullable: true })
  stripeSubscriptionId: string;

  @Column({
    name: 'subscription_status',
    type: 'varchar',
    nullable: true,
    enum: ['trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete'],
  })
  subscriptionStatus: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | null;

  @Column({ name: 'trial_ends_at', type: 'timestamptz', nullable: true })
  trialEndsAt: Date;

  @Column({ name: 'current_period_end', type: 'timestamptz', nullable: true })
  currentPeriodEnd: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'onboarding_completed', default: false })
  onboardingCompleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
