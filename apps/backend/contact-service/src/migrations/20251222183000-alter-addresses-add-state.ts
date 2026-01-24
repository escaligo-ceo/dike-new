import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterAddressesAddState20251222183000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasState = await queryRunner.hasColumn("addresses", "state");
    if (!hasState) {
      await queryRunner.addColumn(
        "addresses",
        new TableColumn({
          name: "state",
          type: "varchar",
          length: "100",
          isNullable: true,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasState = await queryRunner.hasColumn("addresses", "state");
    if (hasState) {
      await queryRunner.dropColumn("addresses", "state");
    }
  }
}
