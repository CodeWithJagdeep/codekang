import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository as TypeOrmRepository } from 'typeorm';
import {
  Organization,
  OrganizationMember,
  OrgRepository,
} from '../entities/organization.entity';
import { Repository } from '../entities/repository.entity';
import type {
  IOrganization,
  IOrganizationMember,
  IRepository,
} from '../common';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: TypeOrmRepository<Organization>,
    @InjectRepository(OrganizationMember)
    private readonly memberRepo: TypeOrmRepository<OrganizationMember>,
    @InjectRepository(OrgRepository)
    private readonly orgRepoRepo: TypeOrmRepository<OrgRepository>,
    @InjectRepository(Repository)
    private readonly repoRepo: TypeOrmRepository<Repository>,
  ) {}

  // ── Called on first dashboard load to guarantee a personal org exists ──────

  async ensureDefaultOrg(userId: string, firstName: string): Promise<IOrganization> {
    const existing = await this.orgRepo.findOne({
      where: { ownerId: userId, isPersonal: true },
    });
    if (existing) return existing as unknown as IOrganization;

    const slug = firstName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'personal';
    // Make slug unique if taken
    const taken = await this.orgRepo.findOne({ where: { slug } });
    const finalSlug = taken ? `${slug}-${userId.slice(0, 6)}` : slug;

    const org = this.orgRepo.create({
      ownerId: userId,
      name: firstName,
      slug: finalSlug,
      isPersonal: true,
    });
    await this.orgRepo.save(org);

    const member = this.memberRepo.create({
      organizationId: org.id,
      userId,
      role: 'owner',
    });
    await this.memberRepo.save(member);

    // Auto-add all existing connected repos to the personal org
    const repos = await this.repoRepo.find({ where: { userId, isInstalled: true } });
    if (repos.length > 0) {
      const links = repos.map((r) =>
        this.orgRepoRepo.create({ orgId: org.id, repoId: r.id, addedBy: userId }),
      );
      await this.orgRepoRepo.save(links);
    }

    return org as unknown as IOrganization;
  }

  async createOrganization(
    userId: string,
    name: string,
    slug: string,
    description?: string,
  ): Promise<IOrganization> {
    const existing = await this.orgRepo.findOne({ where: { slug } });
    if (existing) throw new BadRequestException('Slug already taken');

    const org = this.orgRepo.create({ ownerId: userId, name, slug, description, isPersonal: false });
    await this.orgRepo.save(org);

    const member = this.memberRepo.create({
      organizationId: org.id,
      userId,
      role: 'owner',
    });
    await this.memberRepo.save(member);

    return org as unknown as IOrganization;
  }

  async listOrganizations(userId: string): Promise<IOrganization[]> {
    const memberships = await this.memberRepo.find({ where: { userId } });
    if (memberships.length === 0) return [];

    const orgIds = memberships.map((m) => m.organizationId);
    const orgs = await this.orgRepo.find({
      where: { id: In(orgIds) },
      order: { isPersonal: 'DESC', createdAt: 'ASC' }, // personal org always first
    });

    return orgs as unknown as IOrganization[];
  }

  async getOrganization(orgId: string, userId: string): Promise<IOrganization> {
    const org = await this.orgRepo.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');
    await this.requireMember(orgId, userId);
    return org as unknown as IOrganization;
  }

  async updateOrganization(
    orgId: string,
    userId: string,
    updates: { name?: string; description?: string },
  ): Promise<IOrganization> {
    const org = await this.orgRepo.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');
    if (org.ownerId !== userId) throw new ForbiddenException('Only owner can update');

    Object.assign(org, updates);
    await this.orgRepo.save(org);
    return org as unknown as IOrganization;
  }

  async deleteOrganization(orgId: string, userId: string): Promise<void> {
    const org = await this.orgRepo.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');
    if (org.ownerId !== userId) throw new ForbiddenException('Only owner can delete');
    if (org.isPersonal) throw new ForbiddenException('Cannot delete your personal organization');

    await this.orgRepoRepo.delete({ orgId });
    await this.memberRepo.delete({ organizationId: orgId });
    await this.orgRepo.delete({ id: orgId });
  }

  async listOrgRepos(orgId: string, userId: string): Promise<IRepository[]> {
    const org = await this.orgRepo.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');
    await this.requireMember(orgId, userId);

    // Personal org shows all connected repos for this user
    if (org.isPersonal) {
      const repos = await this.repoRepo.find({
        where: { userId: org.ownerId, isInstalled: true },
        order: { updatedAt: 'DESC' },
      });
      return repos as unknown as IRepository[];
    }

    const links = await this.orgRepoRepo.find({ where: { orgId } });
    if (links.length === 0) return [];

    const repoIds = links.map((l) => l.repoId);
    const repos = await this.repoRepo.find({ where: { id: In(repoIds) } });
    return repos as unknown as IRepository[];
  }

  async getOrgRepoCount(orgId: string): Promise<number> {
    return this.orgRepoRepo.count({ where: { orgId } });
  }

  async addRepoToOrg(orgId: string, repoId: string, userId: string): Promise<void> {
    await this.requireMemberRole(orgId, userId, ['owner', 'admin']);

    const repo = await this.repoRepo.findOne({ where: { id: repoId, userId } });
    if (!repo) throw new NotFoundException('Repository not found or not yours');

    const existing = await this.orgRepoRepo.findOne({ where: { orgId, repoId } });
    if (existing) throw new BadRequestException('Repository already in this organization');

    const link = this.orgRepoRepo.create({ orgId, repoId, addedBy: userId });
    await this.orgRepoRepo.save(link);
  }

  async addRepoToPersonalOrg(userId: string, repoId: string): Promise<void> {
    const personalOrg = await this.orgRepo.findOne({
      where: { ownerId: userId, isPersonal: true },
    });
    if (!personalOrg) return;

    const exists = await this.orgRepoRepo.findOne({ where: { orgId: personalOrg.id, repoId } });
    if (exists) return;

    const link = this.orgRepoRepo.create({ orgId: personalOrg.id, repoId, addedBy: userId });
    await this.orgRepoRepo.save(link).catch(() => {});
  }

  async removeRepoFromOrg(orgId: string, repoId: string, userId: string): Promise<void> {
    const org = await this.orgRepo.findOne({ where: { id: orgId } });
    if (!org) throw new NotFoundException('Organization not found');
    if (org.isPersonal) throw new ForbiddenException('Cannot manually remove repos from personal organization');

    await this.requireMemberRole(orgId, userId, ['owner', 'admin']);

    const link = await this.orgRepoRepo.findOne({ where: { orgId, repoId } });
    if (!link) throw new NotFoundException('Repository not in this organization');

    await this.orgRepoRepo.delete({ id: link.id });
  }

  async listMembers(orgId: string, userId: string): Promise<IOrganizationMember[]> {
    await this.requireMember(orgId, userId);
    const members = await this.memberRepo.find({ where: { organizationId: orgId } });
    return members as unknown as IOrganizationMember[];
  }

  async inviteMember(
    orgId: string,
    inviterUserId: string,
    email: string,
    displayName: string | null,
    role: 'admin' | 'member',
  ): Promise<IOrganizationMember> {
    await this.requireMemberRole(orgId, inviterUserId, ['owner', 'admin']);

    // Admins can only invite members, not other admins
    const inviter = await this.requireMember(orgId, inviterUserId);
    if (inviter.role === 'admin' && role === 'admin') {
      throw new ForbiddenException('Admins cannot invite other admins. Only the owner can.');
    }

    // Prevent duplicate pending invites for same email
    const existing = await this.memberRepo.findOne({
      where: { organizationId: orgId, email },
    });
    if (existing) {
      throw new BadRequestException('An invite for this email already exists in this organization.');
    }

    const member = this.memberRepo.create({
      organizationId: orgId,
      // userId will be set when the invitee accepts — use placeholder for now
      userId: `pending:${email}`,
      email,
      displayName,
      role,
      status: 'pending',
      invitedBy: inviterUserId,
    });
    await this.memberRepo.save(member);
    return member as unknown as IOrganizationMember;
  }

  async removeMember(
    orgId: string,
    actorUserId: string,
    memberId: string,
  ): Promise<void> {
    await this.requireMemberRole(orgId, actorUserId, ['owner', 'admin']);

    const target = await this.memberRepo.findOne({ where: { id: memberId, organizationId: orgId } });
    if (!target) throw new NotFoundException('Member not found in this organization');
    if (target.role === 'owner') throw new ForbiddenException('Cannot remove the organization owner');

    // Admins can only remove regular members
    const actor = await this.requireMember(orgId, actorUserId);
    if (actor.role === 'admin' && target.role === 'admin') {
      throw new ForbiddenException('Admins cannot remove other admins. Only the owner can.');
    }

    await this.memberRepo.delete({ id: memberId });
  }

  async updateMemberRole(
    orgId: string,
    actorUserId: string,
    memberId: string,
    role: 'admin' | 'member',
  ): Promise<IOrganizationMember> {
    // Only owners can change roles
    await this.requireMemberRole(orgId, actorUserId, ['owner']);

    const target = await this.memberRepo.findOne({ where: { id: memberId, organizationId: orgId } });
    if (!target) throw new NotFoundException('Member not found in this organization');
    if (target.role === 'owner') throw new ForbiddenException('Cannot change the owner role');

    target.role = role;
    await this.memberRepo.save(target);
    return target as unknown as IOrganizationMember;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async requireMember(orgId: string, userId: string): Promise<OrganizationMember> {
    const m = await this.memberRepo.findOne({ where: { organizationId: orgId, userId } });
    if (!m) throw new ForbiddenException('Not a member of this organization');
    return m;
  }

  private async requireMemberRole(
    orgId: string,
    userId: string,
    roles: Array<'owner' | 'admin' | 'member'>,
  ): Promise<void> {
    const m = await this.requireMember(orgId, userId);
    if (!roles.includes(m.role)) throw new ForbiddenException('Insufficient permissions');
  }
}
