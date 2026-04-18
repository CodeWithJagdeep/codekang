import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type UsageAction = 'chat' | 'fix_issue' | 'analyze_issue';

@Entity('usage_logs')
export class UsageLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Index()
  @Column({ name: 'conversation_id', nullable: true })
  conversationId: string;

  @Column({ type: 'varchar' })
  action: UsageAction;

  @Column({ name: 'credits_used', default: 1 })
  creditsUsed: number;

  @Column({ name: 'input_tokens', default: 0 })
  inputTokens: number;

  @Column({ name: 'output_tokens', default: 0 })
  outputTokens: number;

  @Column({ name: 'repo_full_name', nullable: true })
  repoFullName: string;

  @Column({ name: 'issue_number', nullable: true, type: 'int' })
  issueNumber: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
