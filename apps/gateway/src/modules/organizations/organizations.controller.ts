import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Inject,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Matches, MaxLength } from 'class-validator';
import { firstValueFrom } from 'rxjs';
import { SERVICES, MESSAGE_PATTERNS, CurrentUser, JwtAuthGuard, PLANS } from '../../common';
import type { IUser } from '../../common';

class CreateOrgDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase letters, numbers, and hyphens only' })
  @MaxLength(50)
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}

class UpdateOrgDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}

class AddRepoDto {
  @IsString()
  @IsNotEmpty()
  repoId: string;
}

class InviteMemberDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string;

  @IsString()
  @IsNotEmpty()
  role: 'admin' | 'member';
}

class UpdateMemberRoleDto {
  @IsString()
  @IsNotEmpty()
  role: 'admin' | 'member';
}

@ApiTags('organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationsProxyController {
  constructor(
    @Inject(SERVICES.REPOS) private readonly reposClient: ClientProxy,
  ) {}

  @Post('ensure-default')
  @ApiOperation({ summary: 'Ensure personal org exists; creates it from first name if not' })
  ensureDefault(@CurrentUser() user: IUser) {
    const firstName = user.name.split(' ')[0];
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.ORG_ENSURE_DEFAULT, {
        userId: user.id,
        firstName,
      }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  create(@CurrentUser() user: IUser, @Body() dto: CreateOrgDto) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.ORG_CREATE, {
        userId: user.id,
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
      }),
    );
  }

  @Get()
  @ApiOperation({ summary: "List authenticated user's organizations" })
  list(@CurrentUser() user: IUser) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.ORG_LIST, { userId: user.id }),
    );
  }

  @Get(':orgId')
  @ApiOperation({ summary: 'Get organization details' })
  getOne(@CurrentUser() user: IUser, @Param('orgId') orgId: string) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.ORG_GET_ONE, { orgId, userId: user.id }),
    );
  }

  @Patch(':orgId')
  @ApiOperation({ summary: 'Update organization (owner only)' })
  update(
    @CurrentUser() user: IUser,
    @Param('orgId') orgId: string,
    @Body() dto: UpdateOrgDto,
  ) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.ORG_UPDATE, {
        orgId,
        userId: user.id,
        updates: dto,
      }),
    );
  }

  @Delete(':orgId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete organization (owner only)' })
  delete(@CurrentUser() user: IUser, @Param('orgId') orgId: string) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.ORG_DELETE, { orgId, userId: user.id }),
    );
  }

  // ── Repos ──────────────────────────────────────────────────────────────────

  @Get(':orgId/repos')
  @ApiOperation({ summary: 'List repositories in organization' })
  listRepos(@CurrentUser() user: IUser, @Param('orgId') orgId: string) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.ORG_LIST_REPOS, { orgId, userId: user.id }),
    );
  }

  @Get(':orgId/members')
  @ApiOperation({ summary: 'List members in organization' })
  listMembers(@CurrentUser() user: IUser, @Param('orgId') orgId: string) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.ORG_LIST_MEMBERS, { orgId, userId: user.id }),
    );
  }

  @Post(':orgId/members')
  @ApiOperation({ summary: 'Invite a member to the organization by email' })
  inviteMember(
    @CurrentUser() user: IUser,
    @Param('orgId') orgId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.ORG_INVITE_MEMBER, {
        orgId,
        userId: user.id,
        email: dto.email,
        displayName: dto.displayName,
        role: dto.role,
      }),
    );
  }

  @Delete(':orgId/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member from the organization' })
  removeMember(
    @CurrentUser() user: IUser,
    @Param('orgId') orgId: string,
    @Param('memberId') memberId: string,
  ) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.ORG_REMOVE_MEMBER, {
        orgId,
        userId: user.id,
        memberId,
      }),
    );
  }

  @Patch(':orgId/members/:memberId')
  @ApiOperation({ summary: 'Update the role of a member in the organization' })
  updateMemberRole(
    @CurrentUser() user: IUser,
    @Param('orgId') orgId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.ORG_UPDATE_MEMBER_ROLE, {
        orgId,
        userId: user.id,
        memberId,
        role: dto.role,
      }),
    );
  }

  @Post(':orgId/repos')
  @ApiOperation({ summary: 'Add a connected repository to this organization' })
  async addRepo(
    @CurrentUser() user: IUser,
    @Param('orgId') orgId: string,
    @Body() dto: AddRepoDto,
  ) {
    // Enforce per-org repo limit based on user's plan
    const maxRepos = PLANS[user.plan]?.features.maxPrivateRepos ?? 5;
    if (maxRepos !== -1) {
      const currentRepos = await firstValueFrom(
        this.reposClient.send(MESSAGE_PATTERNS.ORG_LIST_REPOS, { orgId, userId: user.id }),
      ) as unknown[];
      if (currentRepos.length >= maxRepos) {
        const planName = PLANS[user.plan]?.name ?? 'current';
        throw new ForbiddenException(
          `Your ${planName} plan allows up to ${maxRepos} repositories per organization. Upgrade to add more.`,
        );
      }
    }

    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.ORG_ADD_REPO, {
        orgId,
        repoId: dto.repoId,
        userId: user.id,
      }),
    );
  }

  @Delete(':orgId/repos/:repoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a repository from this organization' })
  removeRepo(
    @CurrentUser() user: IUser,
    @Param('orgId') orgId: string,
    @Param('repoId') repoId: string,
  ) {
    return firstValueFrom(
      this.reposClient.send(MESSAGE_PATTERNS.ORG_REMOVE_REPO, {
        orgId,
        repoId,
        userId: user.id,
      }),
    );
  }
}
