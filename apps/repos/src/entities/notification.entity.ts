import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationType {
  REVIEW_COMPLETE = 'review_complete',
  REVIEW_STARTED = 'review_started',
  PR_OPENED = 'pr_opened',
  ISSUE_DETECTED = 'issue_detected',
  SYSTEM = 'system',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', default: NotificationType.SYSTEM })
  type: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ nullable: true, type: 'text', name: 'link' })
  link: string | null;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
