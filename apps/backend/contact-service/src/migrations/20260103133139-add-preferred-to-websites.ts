import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPreferredToWebsites20260103133139 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "websites",
      new TableColumn({
        name: "is_preferred",
        type: "boolean",
        default: false,
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("websites", "is_preferred");
  }
}
