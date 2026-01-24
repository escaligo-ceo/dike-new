import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class AlterContactsAddDatesCompany20251220160500 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop legacy company column if exists
    const hasCompanyCol = await queryRunner.hasColumn("contacts", "company");
    if (hasCompanyCol) {
      await queryRunner.dropColumn("contacts", "company");
    }

    // Add new columns: birthday, anniversary, company_id
    await queryRunner.addColumns("contacts", [
      new TableColumn({ name: "birthday", type: "date", isNullable: true }),
      new TableColumn({ name: "anniversary", type: "date", isNullable: true }),
      new TableColumn({ name: "company_id", type: "uuid", isNullable: true }),
    ]);

    // Add FK to companies
    await queryRunner.createForeignKey(
      "contacts",
      new TableForeignKey({
        columnNames: ["company_id"],
        referencedTableName: "companies",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove FK
    const table = await queryRunner.getTable("contacts");
    const fk = table?.foreignKeys.find((fk) =>
      fk.columnNames.includes("company_id")
    );
    if (fk) {
      await queryRunner.dropForeignKey("contacts", fk);
    }

    // Drop added columns
    for (const name of ["company_id", "anniversary", "birthday"]) {
      const hasCol = await queryRunner.hasColumn("contacts", name);
      if (hasCol) await queryRunner.dropColumn("contacts", name);
    }

    // Restore legacy company column
    await queryRunner.addColumn(
      "contacts",
      new TableColumn({
        name: "company",
        type: "varchar",
        length: "100",
        isNullable: true,
      })
    );
  }
}
