import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotifications20250830196004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_priority_enum') THEN
          CREATE TYPE notification_priority_enum AS ENUM ('low', 'normal', 'high');
        END IF;
      END$$;
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status_enum') THEN
          CREATE TYPE notification_status_enum AS ENUM ('pending', 'sent', 'failed');
        END IF;
      END$$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid,
        "channel_id" uuid NOT NULL,
        "template_id" uuid,
        "priority" notification_priority_enum NOT NULL DEFAULT 'normal',
        "status" notification_status_enum NOT NULL DEFAULT 'pending',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "deleted_at" timestamp NULL,
        CONSTRAINT "FK_notification_channel" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_notification_template" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE SET NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "notifications" CASCADE;');
    await queryRunner.query('DROP TYPE IF EXISTS notification_status_enum;');
    await queryRunner.query('DROP TYPE IF EXISTS notification_priority_enum;');
  }
}
