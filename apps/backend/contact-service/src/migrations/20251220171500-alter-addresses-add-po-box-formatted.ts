import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterAddressesAddPoBoxFormatted20251220171500 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add po_box
    const hasPoBox = await queryRunner.hasColumn("addresses", "po_box");
    if (!hasPoBox) {
      await queryRunner.addColumn(
        "addresses",
        new TableColumn({
          name: "po_box",
          type: "varchar",
          length: "50",
          isNullable: true,
        })
      );
    }
    // Add formatted
    const hasFormatted = await queryRunner.hasColumn("addresses", "formatted");
    if (!hasFormatted) {
      await queryRunner.addColumn(
        "addresses",
        new TableColumn({ name: "formatted", type: "text", isNullable: true })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasFormatted = await queryRunner.hasColumn("addresses", "formatted");
    if (hasFormatted) {
      await queryRunner.dropColumn("addresses", "formatted");
    }
    const hasPoBox = await queryRunner.hasColumn("addresses", "po_box");
    if (hasPoBox) {
      await queryRunner.dropColumn("addresses", "po_box");
    }
  }
}
