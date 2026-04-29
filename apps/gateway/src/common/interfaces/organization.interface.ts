export interface IOrganization {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  description?: string;
  isPersonal: boolean;
  isArchived: boolean;
  timezone: string | null;
  internalVisibility: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  createdAt: Date;
  updatedAt: Date;
}
