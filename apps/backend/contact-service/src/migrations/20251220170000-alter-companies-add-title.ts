import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterCompaniesAddTitle20251220170000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn("companies", "title");
    if (!hasColumn) {
      await queryRunner.addColumn(
        "companies",
        new TableColumn({
          name: "title",
          type: "varchar",
          length: "150",
          isNullable: true,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.hasColumn("companies", "title");
    if (hasColumn) {
      await queryRunner.dropColumn("companies", "title");
    }
  }
}
