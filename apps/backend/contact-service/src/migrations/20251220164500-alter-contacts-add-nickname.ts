import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterContactsAddNickname20251220164500 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn("contacts", "nickname");
    if (!hasColumn) {
      await queryRunner.addColumn(
        "contacts",
        new TableColumn({
          name: "nickname",
          type: "varchar",
          length: "100",
          isNullable: true,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn("contacts", "nickname");
    if (hasColumn) {
      await queryRunner.dropColumn("contacts", "nickname");
    }
  }
}
