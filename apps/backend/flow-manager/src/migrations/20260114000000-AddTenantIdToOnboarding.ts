import { onboardingsTableName } from "@dike/common";
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddTenantIdToOnboarding20260114000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(onboardingsTableName);
    if (!table) return;

    const tenantIdCol = table.findColumnByName("tenant_id");
    if (!tenantIdCol) {
      await queryRunner.addColumn(
        onboardingsTableName,
        new TableColumn({
          name: "tenant_id",
          type: "uuid",
          isNullable: true,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(onboardingsTableName);
    if (!table) return;

    const tenantIdCol = table.findColumnByName("tenant_id");
    if (tenantIdCol) {
      await queryRunner.dropColumn(onboardingsTableName, "tenant_id");
    }
  }
}
