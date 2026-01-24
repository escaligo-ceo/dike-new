import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateOfficeTable20251112170100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "offices" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text DEFAULT NULL,
        "address_id" uuid DEFAULT NULL,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" timestamptz DEFAULT NULL,
        CONSTRAINT fk_office_tenant FOREIGN KEY ("tenant_id") REFERENCES "tenant" ("id") ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_office_tenant_id ON "offices" ("tenant_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_office_tenant_id;
      DROP TABLE IF EXISTS "offices";
    `);
  }
}
