import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('repositories')
@Index(['userId', 'githubId'], { unique: true })
export class Repository {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'github_id', type: 'bigint' })
  githubId: number;

  @Column()
  owner: string;

  @Column()
  name: string;

  @Index()
  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ default: false })
  private: boolean;

  @Column({ name: 'default_branch', default: 'main' })
  defaultBranch: string;

  @Column({ nullable: true })
  language: string;

  @Column({ name: 'stargazers_count', default: 0 })
  stargazersCount: number;

  @Column({ name: 'is_installed', default: false })
  isInstalled: boolean;

  @Column({ name: 'webhook_id', nullable: true, type: 'bigint' })
  webhookId: number;

  @Column({ name: 'html_url', nullable: true })
  htmlUrl: string;

  @Column({ name: 'github_updated_at', nullable: true, type: 'timestamptz' })
  githubUpdatedAt: Date;

  @Column({ type: 'jsonb', nullable: true, default: '{}' })
  settings: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
