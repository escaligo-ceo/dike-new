import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterContactsAddPrefixSuffix20251220164000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasPrefix = await queryRunner.hasColumn("contacts", "prefix");
    if (!hasPrefix) {
      await queryRunner.addColumn(
        "contacts",
        new TableColumn({
          name: "prefix",
          type: "varchar",
          length: "50",
          isNullable: true,
        })
      );
    }

    const hasSuffix = await queryRunner.hasColumn("contacts", "suffix");
    if (!hasSuffix) {
      await queryRunner.addColumn(
        "contacts",
        new TableColumn({
          name: "suffix",
          type: "varchar",
          length: "50",
          isNullable: true,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasPrefix = await queryRunner.hasColumn("contacts", "prefix");
    if (hasPrefix) {
      await queryRunner.dropColumn("contacts", "prefix");
    }

    const hasSuffix = await queryRunner.hasColumn("contacts", "suffix");
    if (hasSuffix) {
      await queryRunner.dropColumn("contacts", "suffix");
    }
  }
}
