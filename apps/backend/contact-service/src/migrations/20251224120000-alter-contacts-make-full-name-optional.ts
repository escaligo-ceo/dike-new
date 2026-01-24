import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterContactsMakeNamesOptional20251224120000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "contacts",
      "first_name",
      new TableColumn({
        name: "first_name",
        type: "varchar",
        length: "100",
        isNullable: true,
      })
    );

    await queryRunner.changeColumn(
      "contacts",
      "last_name",
      new TableColumn({
        name: "last_name",
        type: "varchar",
        length: "100",
        isNullable: true,
      })
    );

    await queryRunner.changeColumn(
      "contacts",
      "full_name",
      new TableColumn({
        name: "full_name",
        type: "varchar",
        length: "100",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      "contacts",
      "first_name",
      new TableColumn({
        name: "first_name",
        type: "varchar",
        length: "100",
        isNullable: false,
      })
    );

    await queryRunner.changeColumn(
      "contacts",
      "last_name",
      new TableColumn({
        name: "last_name",
        type: "varchar",
        length: "100",
        isNullable: false,
      })
    );

    await queryRunner.changeColumn(
      "contacts",
      "full_name",
      new TableColumn({
        name: "full_name",
        type: "varchar",
        length: "100",
        isNullable: false,
      })
    );
  }
}
