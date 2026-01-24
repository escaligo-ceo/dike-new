import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFeaturePlanTable20251104220139
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "plan_features" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "plan_id" uuid NOT NULL,
        "feature_id" varchar(255) NOT NULL,
        "limit" int DEFAULT NULL,
        "since" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "to" timestamptz DEFAULT NULL,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE "plan_features"
        ADD CONSTRAINT fk_plan
        FOREIGN KEY ("plan_id") REFERENCES "plans" ("id") ON DELETE CASCADE;

      -- Add fk_feature only if referenced column exists and is compatible (varchar/text)
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'features' AND column_name = 'id'
            AND data_type IN ('character varying','text')
        ) THEN
          EXECUTE 'ALTER TABLE "plan_features" ADD CONSTRAINT fk_feature FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE CASCADE';
        ELSE
          RAISE NOTICE 'Skipping fk_feature creation: features.id not present or not varchar/text';
        END IF;
      END$$;

      -- Prevent multiple active relations for same plan+feature (where to IS NULL)
      CREATE UNIQUE INDEX IF NOT EXISTS plan_features_unique_active ON plan_features (plan_id, feature_id) WHERE "to" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "DROP INDEX IF EXISTS plan_features_unique_active;"
    );
    await queryRunner.query(
      'ALTER TABLE "plan_features" DROP CONSTRAINT IF EXISTS fk_plan;'
    );
    await queryRunner.query(
      'ALTER TABLE "plan_features" DROP CONSTRAINT IF EXISTS fk_feature;'
    );
    await queryRunner.query('DROP TABLE IF EXISTS "plan_features" CASCADE;');
  }
}
