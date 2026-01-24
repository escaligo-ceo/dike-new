import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCustomizationLevelToNotifications20250831190000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_customization_level_enum') THEN
          CREATE TYPE notification_customization_level_enum AS ENUM ('0', '1', '2');
        END IF;
      END$$;
    `);
    await queryRunner.query(`
      ALTER TABLE "notifications"
      ADD COLUMN IF NOT EXISTS "customization_level" notification_customization_level_enum NOT NULL DEFAULT '0';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notifications" DROP COLUMN IF EXISTS "customization_level";
    `);
    await queryRunner.query(`
      DROP TYPE IF EXISTS notification_customization_level_enum;
    `);
  }
}
