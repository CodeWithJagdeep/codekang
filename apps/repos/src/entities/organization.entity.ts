import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'owner_id' })
  ownerId: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'is_personal', default: false })
  isPersonal: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('organization_members')
@Index(['organizationId', 'userId'], { unique: true })
export class OrganizationMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'organization_id' })
  organizationId: string;

  @Index()
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', default: 'member' })
  role: 'owner' | 'admin' | 'member';

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ name: 'display_name', type: 'varchar', nullable: true })
  displayName: string | null;

  @Column({ type: 'varchar', default: 'active' })
  status: 'active' | 'pending';

  @Column({ name: 'invited_by', type: 'varchar', nullable: true })
  invitedBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('org_repositories')
@Index(['orgId', 'repoId'], { unique: true })
export class OrgRepository {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'org_id' })
  orgId: string;

  @Index()
  @Column({ name: 'repo_id' })
  repoId: string;

  @Column({ name: 'added_by' })
  addedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
