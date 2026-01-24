import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddIsPecToEmails20260102150000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "emails",
      new TableColumn({
        name: "is_PEC",
        type: "boolean",
        default: false,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("emails", "is_PEC");
  }
}
