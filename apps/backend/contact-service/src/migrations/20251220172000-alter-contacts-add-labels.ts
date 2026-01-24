import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterContactsAddLabels20251220172000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn("contacts", "labels");
    if (!hasColumn) {
      await queryRunner.addColumn(
        "contacts",
        new TableColumn({ name: "labels", type: "text", isNullable: true, isArray: true })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn("contacts", "labels");
    if (hasColumn) {
      await queryRunner.dropColumn("contacts", "labels");
    }
  }
}
