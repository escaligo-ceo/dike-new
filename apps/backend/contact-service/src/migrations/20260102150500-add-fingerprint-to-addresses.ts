import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddFingerprintToAddresses20260102150500 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "addresses",
      new TableColumn({
        name: "fingerprint",
        type: "varchar",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("addresses", "fingerprint");
  }
}
