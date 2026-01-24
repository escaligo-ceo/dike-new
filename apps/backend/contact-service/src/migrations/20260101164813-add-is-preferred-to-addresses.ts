import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class addIsPreferredToAddresses20260101164813 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "addresses",
      new TableColumn({
        name: "is_preferred",
        type: "boolean",
        default: false,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("addresses", "is_preferred");
  }
}
