import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterContactsAddPhotoUrl20251220170500 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn("contacts", "photo_url");
    if (!hasColumn) {
      await queryRunner.addColumn(
        "contacts",
        new TableColumn({
          name: "photo_url",
          type: "varchar",
          length: "255",
          isNullable: true,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn("contacts", "photo_url");
    if (hasColumn) {
      await queryRunner.dropColumn("contacts", "photo_url");
    }
  }
}
