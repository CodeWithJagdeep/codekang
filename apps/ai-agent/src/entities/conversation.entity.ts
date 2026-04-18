import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { IMessage } from '../common';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ default: 'New Conversation' })
  title: string;

  @Column({ type: 'jsonb', default: [] })
  messages: IMessage[];

  @Column({ name: 'repo_owner', nullable: true })
  repoOwner: string;

  @Column({ name: 'repo_name', nullable: true })
  repoName: string;

  @Column({ name: 'issue_number', nullable: true, type: 'int' })
  issueNumber: number;

  @Column({ name: 'issue_title', nullable: true })
  issueTitle: string;

  @Column({ name: 'context', nullable: true, type: 'text' })
  context: string;

  @Column({ name: 'total_credits_used', default: 0 })
  totalCreditsUsed: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
