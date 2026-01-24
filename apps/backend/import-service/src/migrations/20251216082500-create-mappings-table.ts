import { mappingsTableName } from "@dike/common";
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMappingsTable20251216082500 implements MigrationInterface {
  name = "CreateMappingsTable20251216082500";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_name = '${mappingsTableName}' AND table_schema = 'public'
        ) THEN
          CREATE TABLE "${mappingsTableName}" (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "name" varchar(255) NOT NULL,
            "version" int NOT NULL DEFAULT 1,
            "tenantId" uuid NOT NULL,
            "sourceType" varchar(50) NOT NULL,
            "headers" text[] NOT NULL,
            "headerNormalized" text[] NOT NULL,
            "headerHash" text NOT NULL,
            "headerHashAlgorithm" text NOT NULL,
            "mapping" jsonb NOT NULL,
            "defaults" jsonb NULL,
            "created_at" timestamptz NOT NULL DEFAULT now(),
            "updated_at" timestamptz NOT NULL DEFAULT now(),
            "ownerId" uuid
          );
          CREATE INDEX IF NOT EXISTS "IDX_mappings_headerHash" ON "mappings" ("headerHash");
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_name = '${mappingsTableName}' AND table_schema = 'public'
        ) THEN
          DROP TABLE IF EXISTS "${mappingsTableName}" CASCADE;
        END IF;
      END
      $$;
    `);
  }
}
