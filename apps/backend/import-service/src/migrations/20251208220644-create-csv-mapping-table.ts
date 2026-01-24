import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCsvMappingTable20251208220644 implements MigrationInterface {
  name = "CreateCsvMappingTable20251208220644";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure extension used by uuid default is available
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "csv_mappings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "tenantId" varchar(255) NOT NULL,
        "entityType" varchar(255) NOT NULL,
        "mapping" jsonb NOT NULL,
        "isDefault" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `);

    // Composite index to speed lookups by tenant + entity
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_csv_mappings_tenant_entity" ON "csv_mappings" ("tenantId", "entityType")`
    );

    // Index for default flag
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_csv_mappings_default" ON "csv_mappings" ("isDefault")`
    );

    // Enforce only one default per tenant+entityType
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "uniq_csv_mappings_default_per_tenant_entity" ON "csv_mappings" ("tenantId", "entityType") WHERE "isDefault" = true`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "uniq_csv_mappings_default_per_tenant_entity"`
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_csv_mappings_default"`);
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_csv_mappings_tenant_entity"`
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "csv_mappings"`);
  }
}
