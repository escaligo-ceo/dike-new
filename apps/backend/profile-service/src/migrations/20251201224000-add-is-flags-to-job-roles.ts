import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsFlagsToJobRoles20251201224000 implements MigrationInterface {
  name = "AddIsFlagsToJobRoles20251201224000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add is_custom boolean column if missing, default false
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'job_roles' AND column_name = 'is_custom'
        ) THEN
          ALTER TABLE job_roles ADD COLUMN is_custom boolean NOT NULL DEFAULT false;
        END IF;
      END$$;
    `);

    // Add is_default boolean column if missing, default false
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'job_roles' AND column_name = 'is_default'
        ) THEN
          ALTER TABLE job_roles ADD COLUMN is_default boolean NOT NULL DEFAULT false;
        END IF;
      END$$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop is_default if exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'job_roles' AND column_name = 'is_default'
        ) THEN
          ALTER TABLE job_roles DROP COLUMN is_default;
        END IF;
      END$$;
    `);

    // Drop is_custom if exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'job_roles' AND column_name = 'is_custom'
        ) THEN
          ALTER TABLE job_roles DROP COLUMN is_custom;
        END IF;
      END$$;
    `);
  }
}
