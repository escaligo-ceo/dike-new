import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTemplates20250830196002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "templates" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "channel_id" uuid NOT NULL,
        "locale" varchar(5) NOT NULL DEFAULT 'it-IT',
        "version" integer NOT NULL,
        "subject" varchar NOT NULL,
        "body" text NOT NULL,
        "metadata" jsonb,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamp NULL,
        CONSTRAINT "FK_template_channel" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "templates" CASCADE;');
  }
}
