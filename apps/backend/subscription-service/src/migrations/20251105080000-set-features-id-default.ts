import { MigrationInterface, QueryRunner } from "typeorm";

export class SetFeaturesIdDefault20251105080000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure pgcrypto is available (gen_random_uuid)
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    // If the id column exists and does not have a default, set it to gen_random_uuid()
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='features' AND column_name='id'
        ) THEN
          -- Only set default if none is present
          IF NOT EXISTS (
            SELECT 1 FROM pg_attrdef ad
            JOIN pg_class c ON ad.adrelid = c.oid
            JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ad.adnum
            WHERE c.relname = 'features' AND a.attname = 'id'
          ) THEN
            ALTER TABLE "features" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
          END IF;
        END IF;
      END$$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the default if present
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name='features' AND column_name='id'
        ) THEN
          ALTER TABLE "features" ALTER COLUMN "id" DROP DEFAULT;
        END IF;
      END$$;
    `);
  }
}
