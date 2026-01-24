import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTenantTable20251112170000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tenant" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(255) NOT NULL UNIQUE,
        "description" varchar(255) DEFAULT NULL,
        "owner_id" uuid NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_tenant_owner_id ON "tenant" ("owner_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_tenant_owner_id;
      DROP TABLE IF EXISTS "tenant";
    `);
  }
}
