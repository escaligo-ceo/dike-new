import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPhoneticMiddleNameToContacts20260117140700 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "contacts",
      new TableColumn({
        name: "phonetic_middle_name",
        type: "varchar",
        length: "100",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("contacts", "phonetic_middle_name");
  }
}
