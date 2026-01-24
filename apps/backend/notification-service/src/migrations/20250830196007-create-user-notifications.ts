import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserNotifications20250830196007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_notifications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "notification_id" uuid NOT NULL,
        "is_read" boolean DEFAULT false,
        "read_at" timestamp NULL,
        "deleted_at" timestamp NULL,
        CONSTRAINT "FK_user_notification_notification" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "user_notifications" CASCADE;');
  }
}
