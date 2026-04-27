import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum ContactStatus { NEW = 'new', READ = 'read', REPLIED = 'replied' }
export enum InquiryType { SALES = 'Sales & Enterprise', SUPPORT = 'Technical Support', PARTNERSHIP = 'Partnerships', OTHER = 'Other' }

@Entity('contact_inquiries')
export class ContactInquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  company: string;

  @Column({ type: 'varchar', default: InquiryType.OTHER })
  inquiryType: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', default: ContactStatus.NEW })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
