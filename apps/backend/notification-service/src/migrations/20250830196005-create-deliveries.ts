import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDeliveries20250830196005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'delivery_status_enum') THEN
          CREATE TYPE delivery_status_enum AS ENUM ('pending', 'sent', 'failed', 'retried');
        END IF;
      END$$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "deliveries" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "notification_id" uuid NOT NULL,
        "channel_id" uuid NOT NULL,
        "status" delivery_status_enum NOT NULL DEFAULT 'pending',
        "error" varchar,
        CONSTRAINT "FK_delivery_notification" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_delivery_channel" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "deliveries" CASCADE;');
    await queryRunner.query('DROP TYPE IF EXISTS delivery_status_enum;');
  }
}
