import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddTypeToWebsites20260103133406 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "websites",
      new TableColumn({
        name: "type",
        type: "varchar",
        length: "50",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("websites", "type");
  }
}
