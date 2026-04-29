import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrganizationsService } from './organizations.service';
import { MESSAGE_PATTERNS } from '../common';

@Controller()
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @MessagePattern(MESSAGE_PATTERNS.ORG_ENSURE_DEFAULT)
  ensureDefault(@Payload() data: { userId: string; firstName: string }) {
    return this.orgsService.ensureDefaultOrg(data.userId, data.firstName);
  }

  @MessagePattern(MESSAGE_PATTERNS.ORG_CREATE)
  create(
    @Payload() data: { userId: string; name: string; slug: string; description?: string },
  ) {
    return this.orgsService.createOrganization(data.userId, data.name, data.slug, data.description);
  }

  @MessagePattern(MESSAGE_PATTERNS.ORG_LIST)
  list(@Payload() data: { userId: string }) {
    return this.orgsService.listOrganizations(data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.ORG_GET_ONE)
  getOne(@Payload() data: { orgId: string; userId: string }) {
    return this.orgsService.getOrganization(data.orgId, data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.ORG_UPDATE)
  update(
    @Payload() data: { orgId: string; userId: string; updates: { name?: string; description?: string } },
  ) {
    return this.orgsService.updateOrganization(data.orgId, data.userId, data.updates);
  }

  @MessagePattern(MESSAGE_PATTERNS.ORG_DELETE)
  delete(@Payload() data: { orgId: string; userId: string }) {
    return this.orgsService.deleteOrganization(data.orgId, data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.ORG_ARCHIVE)
  archive(@Payload() data: { orgId: string; userId: string }) {
    return this.orgsService.archiveOrganization(data.orgId, data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.ORG_LIST_REPOS)
  listRepos(@Payload() data: { orgId: string; userId: string }) {
    return this.orgsService.listOrgRepos(data.orgId, data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.ORG_ADD_REPO)
  addRepo(@Payload() data: { orgId: string; repoId: string; userId: string }) {
    return this.orgsService.addRepoToOrg(data.orgId, data.repoId, data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.ORG_REMOVE_REPO)
  removeRepo(@Payload() data: { orgId: string; repoId: string; userId: string }) {
    return this.orgsService.removeRepoFromOrg(data.orgId, data.repoId, data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.ORG_LIST_MEMBERS)
  listMembers(@Payload() data: { orgId: string; userId: string }) {
    return this.orgsService.listMembers(data.orgId, data.userId);
  }

  @MessagePattern(MESSAGE_PATTERNS.ORG_INVITE_MEMBER)
  inviteMember(
    @Payload() data: { orgId: string; userId: string; email: string; displayName?: string; role: 'admin' | 'member' },
  ) {
    return this.orgsService.inviteMember(data.orgId, data.userId, data.email, data.displayName ?? null, data.role);
  }

  @MessagePattern(MESSAGE_PATTERNS.ORG_REMOVE_MEMBER)
  removeMember(@Payload() data: { orgId: string; userId: string; memberId: string }) {
    return this.orgsService.removeMember(data.orgId, data.userId, data.memberId);
  }

  @MessagePattern(MESSAGE_PATTERNS.ORG_UPDATE_MEMBER_ROLE)
  updateMemberRole(
    @Payload() data: { orgId: string; userId: string; memberId: string; role: 'admin' | 'member' },
  ) {
    return this.orgsService.updateMemberRole(data.orgId, data.userId, data.memberId, data.role);
  }

  @MessagePattern(MESSAGE_PATTERNS.REPOS_DELETE_USER_DATA)
  async deleteUserData(@Payload() data: { userId: string }) {
    await this.orgsService.deleteUserData(data.userId);
    return { success: true };
  }
}
