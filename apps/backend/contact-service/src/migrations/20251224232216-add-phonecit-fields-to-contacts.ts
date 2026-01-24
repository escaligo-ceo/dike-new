import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPhonecitFieldsToContacts20251224232216 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "contacts",
      new TableColumn({
        name: "phonetic_first_name",
        type: "varchar",
        length: "100",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "contacts",
      new TableColumn({
        name: "phonetic_last_name",
        type: "varchar",
        length: "100",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("contacts", "phonetic_last_name");
    await queryRunner.dropColumn("contacts", "phonetic_first_name");
  }
}
