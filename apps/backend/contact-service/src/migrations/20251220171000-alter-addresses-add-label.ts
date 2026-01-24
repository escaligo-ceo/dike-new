import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterAddressesAddLabel20251220171000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasLabel = await queryRunner.hasColumn("addresses", "label");
    if (!hasLabel) {
      await queryRunner.addColumn(
        "addresses",
        new TableColumn({
          name: "label",
          type: "varchar",
          length: "100",
          isNullable: true,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasLabel = await queryRunner.hasColumn("addresses", "label");
    if (hasLabel) {
      await queryRunner.dropColumn("addresses", "label");
    }
  }
}
