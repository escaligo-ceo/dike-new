import { MigrationInterface, QueryRunner } from "typeorm";

// Removes legacy 'label' column from job_roles, preserving data by merging into 'name' when name is null.
export class DropLabelFromJobRoles20251201224500 implements MigrationInterface {
  name = "DropLabelFromJobRoles20251201224500";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // If legacy column 'label' exists, copy non-null values into name where name is NULL, then drop column.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'job_roles' AND column_name = 'label'
        ) THEN
          -- Backfill name with label where name is null
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'job_roles' AND column_name = 'name'
          ) THEN
            EXECUTE 'UPDATE job_roles SET name = label WHERE name IS NULL AND label IS NOT NULL';
          END IF;
          -- Drop the legacy column
          ALTER TABLE job_roles DROP COLUMN label;
        END IF;
      END$$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate label column (without data) if it does not exist; cannot restore original values reliably.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'job_roles' AND column_name = 'label'
        ) THEN
          ALTER TABLE job_roles ADD COLUMN label varchar(100) NULL;
        END IF;
      END$$;
    `);
  }
}
