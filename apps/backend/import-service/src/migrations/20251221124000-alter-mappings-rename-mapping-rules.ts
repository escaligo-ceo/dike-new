import { mappingsTableName } from "@dike/common";
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterMappingsRenameMappingRules20251221124000 implements MigrationInterface {
  name = "AlterMappingsRenameMappingRules20251221124000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(mappingsTableName);
    if (!table) return;

    const hasMappingRules = !!table.columns.find(
      (c) => c.name === "mappingRules"
    );
    const hasMapping = !!table.columns.find((c) => c.name === "mapping");

    // Add mappingRules column if missing (nullable initially)
    if (!hasMappingRules) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: "mappingRules",
          type: "jsonb",
          isNullable: true,
          default: null as any,
        })
      );
    }

    // Copy data from legacy 'mapping' into 'mappingRules'
    if (hasMapping) {
      await queryRunner.query(
        `UPDATE "${mappingsTableName}" SET "mappingRules" = "mapping" WHERE "mappingRules" IS NULL AND "mapping" IS NOT NULL`
      );
    }

    // Ensure mappingRules is not null and has default '{}'
    await queryRunner.query(
      `ALTER TABLE "${mappingsTableName}" ALTER COLUMN "mappingRules" SET DEFAULT '{}'::jsonb`
    );
    await queryRunner.query(
      `UPDATE "${mappingsTableName}" SET "mappingRules" = '{}'::jsonb WHERE "mappingRules" IS NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "${mappingsTableName}" ALTER COLUMN "mappingRules" SET NOT NULL`
    );

    // Drop legacy 'mapping' column if present
    if (hasMapping) {
      await queryRunner.query(`ALTER TABLE "${mappingsTableName}" DROP COLUMN "mapping"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(mappingsTableName);
    if (!table) return;

    const hasMapping = !!table.columns.find((c) => c.name === "mapping");
    const hasMappingRules = !!table.columns.find(
      (c) => c.name === "mappingRules"
    );

    // Recreate legacy 'mapping' column if missing
    if (!hasMapping) {
      await queryRunner.query(
        `ALTER TABLE "${mappingsTableName}" ADD COLUMN "mapping" jsonb`
      );
    }

    // Copy back from mappingRules to mapping
    if (hasMappingRules) {
      await queryRunner.query(
        `UPDATE "${mappingsTableName}" SET "mapping" = "mappingRules" WHERE "mappingRules" IS NOT NULL`
      );
    }

    // Drop mappingRules column
    if (hasMappingRules) {
      await queryRunner.query(
        `ALTER TABLE "${mappingsTableName}" DROP COLUMN "mappingRules"`
      );
    }
  }
}
