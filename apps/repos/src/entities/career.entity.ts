import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  INTERVIEWING = 'interviewing',
  REJECTED = 'rejected',
  OFFER = 'offer',
}

@Entity('career_applications')
export class CareerApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  jobSlug: string;

  @Column()
  jobTitle: string;

  @Column({ nullable: true })
  resumeUrl: string; // Firebase Storage URL or any URL

  @Column({ type: 'text', nullable: true })
  coverNote: string;

  @Column({ type: 'varchar', default: ApplicationStatus.PENDING })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
