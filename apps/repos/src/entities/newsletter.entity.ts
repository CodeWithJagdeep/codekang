import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('newsletter_subscribers')
export class NewsletterSubscriber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  source: string; // 'footer', 'blog', etc.

  @CreateDateColumn()
  createdAt: Date;
}
