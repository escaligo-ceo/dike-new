import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePreferences20250830196006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "preferences" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "notification_id" uuid NOT NULL,
        "is_read" boolean DEFAULT false,
        "read_at" timestamp NULL,
        "deleted_at" timestamp NULL,
        CONSTRAINT "FK_preference_notification" FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "preferences" CASCADE;');
  }
}
