import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterContactsAddMiddleName20251220163000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn("contacts", "middle_name");
    if (!hasColumn) {
      await queryRunner.addColumn(
        "contacts",
        new TableColumn({
          name: "middle_name",
          type: "varchar",
          length: "100",
          isNullable: true,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn("contacts", "middle_name");
    if (hasColumn) {
      await queryRunner.dropColumn("contacts", "middle_name");
    }
  }
}
