import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1715000000000 implements MigrationInterface {
  name = 'InitialSchema1715000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "name" character varying NOT NULL,
        "avatar" character varying,
        "organization_name" character varying,
        "provider" character varying NOT NULL DEFAULT 'github',
        "provider_id" character varying NOT NULL,
        "github_username" character varying,
        "github_access_token" text,
        "gitlab_username" character varying,
        "gitlab_access_token" text,
        "bitbucket_username" character varying,
        "bitbucket_access_token" text,
        "refresh_token" text,
        "plan" character varying NOT NULL DEFAULT 'free',
        "razorpay_subscription_id" character varying,
        "credits_used" integer NOT NULL DEFAULT 0,
        "credits_reset" TIMESTAMP WITH TIME ZONE,
        "is_active" boolean NOT NULL DEFAULT true,
        "onboarding_completed" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_provider_id" ON "users" ("provider_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "refresh_token_blacklist" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "token_hash" character varying NOT NULL,
        "user_id" character varying NOT NULL,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_refresh_token_hash" UNIQUE ("token_hash"),
        CONSTRAINT "PK_refresh_token_blacklist" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_rtb_token_hash" ON "refresh_token_blacklist" ("token_hash")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_rtb_user_id" ON "refresh_token_blacklist" ("user_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "otps" (
        "email" character varying NOT NULL,
        "code" character varying NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        CONSTRAINT "PK_otps" PRIMARY KEY ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_integrations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" character varying NOT NULL,
        "provider" character varying(50) NOT NULL,
        "status" character varying NOT NULL DEFAULT 'connected',
        "access_token" text,
        "connected_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_integrations_user_provider" UNIQUE ("user_id", "provider"),
        CONSTRAINT "PK_user_integrations" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_user_integrations_user_provider" ON "user_integrations" ("user_id", "provider")`,
    );

    await queryRunner.query(`
      CREATE TABLE "user_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" character varying NOT NULL,
        "device" character varying,
        "os" character varying,
        "ip" character varying,
        "location" character varying,
        "lastActive" TIMESTAMP NOT NULL DEFAULT now(),
        "isValid" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_sessions" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_sessions"`);
    await queryRunner.query(`DROP INDEX "IDX_user_integrations_user_provider"`);
    await queryRunner.query(`DROP TABLE "user_integrations"`);
    await queryRunner.query(`DROP TABLE "otps"`);
    await queryRunner.query(`DROP INDEX "IDX_rtb_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_rtb_token_hash"`);
    await queryRunner.query(`DROP TABLE "refresh_token_blacklist"`);
    await queryRunner.query(`DROP INDEX "IDX_users_provider_id"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
