import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddVATAndSDICodesToCompany20251224232145 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "companies",
      new TableColumn({
        name: "VAT_code",
        type: "varchar",
        length: "50",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "companies",
      new TableColumn({
        name: "SDI_code",
        type: "varchar",
        length: "50",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("companies", "SDI_code");
    await queryRunner.dropColumn("companies", "VAT_code");
  }
}
