import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1715000000000 implements MigrationInterface {
  name = 'InitialSchema1715000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "conversations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" character varying NOT NULL,
        "title" character varying NOT NULL DEFAULT 'New Conversation',
        "messages" jsonb NOT NULL DEFAULT '[]',
        "repo_owner" character varying,
        "repo_name" character varying,
        "issue_number" integer,
        "issue_title" character varying,
        "context" text,
        "total_credits_used" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_conversations" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_conversations_user_id" ON "conversations" ("user_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "usage_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" character varying NOT NULL,
        "conversation_id" character varying,
        "action" character varying NOT NULL,
        "credits_used" integer NOT NULL DEFAULT 1,
        "input_tokens" integer NOT NULL DEFAULT 0,
        "output_tokens" integer NOT NULL DEFAULT 0,
        "repo_full_name" character varying,
        "issue_number" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_usage_logs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_usage_logs_user_id" ON "usage_logs" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_usage_logs_conversation_id" ON "usage_logs" ("conversation_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_usage_logs_conversation_id"`);
    await queryRunner.query(`DROP INDEX "IDX_usage_logs_user_id"`);
    await queryRunner.query(`DROP TABLE "usage_logs"`);
    await queryRunner.query(`DROP INDEX "IDX_conversations_user_id"`);
    await queryRunner.query(`DROP TABLE "conversations"`);
  }
}
