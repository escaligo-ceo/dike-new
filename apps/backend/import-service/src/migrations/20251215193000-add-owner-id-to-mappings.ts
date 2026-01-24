import { MigrationInterface, QueryRunner } from "typeorm";
import { mappingsTableName } from "@dike/common";

export class AddOwnerIdToMappings20251215193000 implements MigrationInterface {
  name = "AddOwnerIdToMappings20251215193000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure extension for uuid generation exists (if needed elsewhere)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Add ownerId only if table exists to avoid errors on fresh DBs
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_name = '${mappingsTableName}' AND table_schema = 'public'
        ) THEN
          BEGIN
            EXECUTE 'ALTER TABLE "${mappingsTableName}" ADD COLUMN IF NOT EXISTS "ownerId" uuid';
            EXECUTE 'CREATE INDEX IF NOT EXISTS "IDX_${mappingsTableName}_ownerId" ON "${mappingsTableName}" ("ownerId")';
          EXCEPTION WHEN others THEN
            RAISE NOTICE 'Skipping ownerId migration on mappings due to: %', SQLERRM;
          END;
        ELSE
          RAISE NOTICE 'Table "${mappingsTableName}" does not exist; skipping ownerId addition.';
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index and column
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_name = '${mappingsTableName}' AND table_schema = 'public'
        ) THEN
          BEGIN
            EXECUTE 'DROP INDEX IF EXISTS "IDX_${mappingsTableName}_ownerId"';
            EXECUTE 'ALTER TABLE "${mappingsTableName}" DROP COLUMN IF EXISTS "ownerId"';
          EXCEPTION WHEN others THEN
            RAISE NOTICE 'Skipping down migration for ownerId due to: %', SQLERRM;
          END;
        ELSE
          RAISE NOTICE 'Table "${mappingsTableName}" does not exist; skipping down migration.';
        END IF;
      END
      $$;
    `);
  }
}
