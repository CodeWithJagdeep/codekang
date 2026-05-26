import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1715000000000 implements MigrationInterface {
  name = 'InitialSchema1715000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "repositories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" character varying NOT NULL,
        "github_id" bigint NOT NULL,
        "owner" character varying NOT NULL,
        "name" character varying NOT NULL,
        "full_name" character varying NOT NULL,
        "description" text,
        "private" boolean NOT NULL DEFAULT false,
        "default_branch" character varying NOT NULL DEFAULT 'main',
        "language" character varying,
        "stargazers_count" integer NOT NULL DEFAULT 0,
        "is_installed" boolean NOT NULL DEFAULT false,
        "webhook_id" bigint,
        "html_url" character varying,
        "github_updated_at" TIMESTAMP WITH TIME ZONE,
        "settings" jsonb DEFAULT '{}',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_repositories_user_github" UNIQUE ("user_id", "github_id"),
        CONSTRAINT "PK_repositories" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_repositories_user_id" ON "repositories" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_repositories_full_name" ON "repositories" ("full_name")`,
    );

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" character varying NOT NULL,
        "type" character varying NOT NULL DEFAULT 'system',
        "title" character varying NOT NULL,
        "message" text NOT NULL,
        "link" text,
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_created_at" ON "notifications" ("created_at")`,
    );

    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "owner_id" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "name" character varying NOT NULL,
        "description" text,
        "is_personal" boolean NOT NULL DEFAULT false,
        "is_archived" boolean NOT NULL DEFAULT false,
        "timezone" character varying,
        "internal_visibility" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_organizations_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_organizations" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_organizations_owner_id" ON "organizations" ("owner_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "organization_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organization_id" character varying NOT NULL,
        "user_id" character varying NOT NULL,
        "role" character varying NOT NULL DEFAULT 'member',
        "email" character varying,
        "display_name" character varying,
        "status" character varying NOT NULL DEFAULT 'active',
        "invited_by" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_org_members_org_user" UNIQUE ("organization_id", "user_id"),
        CONSTRAINT "PK_organization_members" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_org_members_org_id" ON "organization_members" ("organization_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_org_members_user_id" ON "organization_members" ("user_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "org_repositories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "org_id" character varying NOT NULL,
        "repo_id" character varying NOT NULL,
        "added_by" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_org_repositories_org_repo" UNIQUE ("org_id", "repo_id"),
        CONSTRAINT "PK_org_repositories" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_org_repos_org_id" ON "org_repositories" ("org_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_org_repos_repo_id" ON "org_repositories" ("repo_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" character varying NOT NULL,
        "action" character varying NOT NULL,
        "resource" character varying,
        "ipAddress" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "newsletter_subscribers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "source" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_newsletter_email" UNIQUE ("email"),
        CONSTRAINT "PK_newsletter_subscribers" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_newsletter_email" ON "newsletter_subscribers" ("email")`,
    );

    await queryRunner.query(`
      CREATE TABLE "contact_inquiries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "company" character varying,
        "inquiryType" character varying NOT NULL DEFAULT 'Other',
        "message" text NOT NULL,
        "status" character varying NOT NULL DEFAULT 'new',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_contact_inquiries" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "career_applications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying,
        "jobSlug" character varying NOT NULL,
        "jobTitle" character varying NOT NULL,
        "resumeUrl" character varying,
        "coverNote" text,
        "status" character varying NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_career_applications" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE TYPE "support_ticket_status_enum" AS ENUM ('open', 'pending', 'resolved')`,
    );
    await queryRunner.query(
      `CREATE TYPE "support_ticket_priority_enum" AS ENUM ('low', 'medium', 'high')`,
    );
    await queryRunner.query(`
      CREATE TABLE "support_tickets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" character varying NOT NULL,
        "subject" character varying NOT NULL,
        "category" character varying NOT NULL,
        "status" "support_ticket_status_enum" NOT NULL DEFAULT 'open',
        "priority" "support_ticket_priority_enum" NOT NULL DEFAULT 'medium',
        "rating" integer,
        "feedback" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_support_tickets" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "support_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ticketId" character varying NOT NULL,
        "author" character varying(50) NOT NULL,
        "content" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_support_messages" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "support_messages"`);
    await queryRunner.query(`DROP TABLE "support_tickets"`);
    await queryRunner.query(`DROP TYPE "support_ticket_priority_enum"`);
    await queryRunner.query(`DROP TYPE "support_ticket_status_enum"`);
    await queryRunner.query(`DROP TABLE "career_applications"`);
    await queryRunner.query(`DROP TABLE "contact_inquiries"`);
    await queryRunner.query(`DROP INDEX "IDX_newsletter_email"`);
    await queryRunner.query(`DROP TABLE "newsletter_subscribers"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP INDEX "IDX_org_repos_repo_id"`);
    await queryRunner.query(`DROP INDEX "IDX_org_repos_org_id"`);
    await queryRunner.query(`DROP TABLE "org_repositories"`);
    await queryRunner.query(`DROP INDEX "IDX_org_members_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_org_members_org_id"`);
    await queryRunner.query(`DROP TABLE "organization_members"`);
    await queryRunner.query(`DROP INDEX "IDX_organizations_owner_id"`);
    await queryRunner.query(`DROP TABLE "organizations"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_user_id"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP INDEX "IDX_repositories_full_name"`);
    await queryRunner.query(`DROP INDEX "IDX_repositories_user_id"`);
    await queryRunner.query(`DROP TABLE "repositories"`);
  }
}
