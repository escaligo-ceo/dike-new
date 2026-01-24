import { mappingsTableName } from "@dike/common";
import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterMappingsNameOptional20251223120000 implements MigrationInterface {
  name = "AlterMappingsNameOptional20251223120000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(mappingsTableName);
    if (!table) return;

    // Alter the 'name' column to be nullable
    const nameColumn = table.columns.find((c) => c.name === "name");
    if (nameColumn && !nameColumn.isNullable) {
      await queryRunner.query(
        `ALTER TABLE "${mappingsTableName}" ALTER COLUMN "name" DROP NOT NULL`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(mappingsTableName);
    if (!table) return;

    // Revert the 'name' column to be NOT NULL (with default value for existing nulls)
    const nameColumn = table.columns.find((c) => c.name === "name");
    if (nameColumn && nameColumn.isNullable) {
      // First, set any null values to a default value
      await queryRunner.query(
        `UPDATE "${mappingsTableName}" SET "name" = 'Unnamed Mapping' WHERE "name" IS NULL`
      );
      // Then, add the NOT NULL constraint
      await queryRunner.query(
        `ALTER TABLE "${mappingsTableName}" ALTER COLUMN "name" SET NOT NULL`
      );
    }
  }
}
