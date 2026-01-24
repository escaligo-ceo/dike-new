import { profileTableName } from "@dike/common";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class RenameProfileColumns1715170000000 implements MigrationInterface {
  private async renameIfExists(
    queryRunner: QueryRunner,
    tableName: string,
    from: string,
    to: string
  ) {
    const table: Table | undefined = await queryRunner.getTable(tableName);
    if (!table) return false;

    const fromCol = table.findColumnByName(from);
    const toCol = table.findColumnByName(to);

    if (fromCol && !toCol) {
      await queryRunner.renameColumn(table, fromCol, to);
      return true;
    }
    return false;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.renameIfExists(
      queryRunner,
      profileTableName,
      "defaultRedirectUrl",
      "redirectUrl"
    );
    await this.renameIfExists(queryRunner, profileTableName, "defaultTenantId", "tenantId");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.renameIfExists(
      queryRunner,
      profileTableName,
      "redirectUrl",
      "defaultRedirectUrl"
    );
    await this.renameIfExists(queryRunner, profileTableName, "tenantId", "defaultTenantId");
  }
}
