import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class AlterCompaniesAddContactId20251222182000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add contact_id column
    await queryRunner.addColumn(
      "companies",
      new TableColumn({ name: "contact_id", type: "uuid", isNullable: true })
    );

    // Add foreign key to contacts(id)
    await queryRunner.createForeignKey(
      "companies",
      new TableForeignKey({
        name: "FK_COMPANIES_CONTACT_ID",
        columnNames: ["contact_id"],
        referencedTableName: "contacts",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );

    // Add index on contact_id
    await queryRunner.createIndex(
      "companies",
      new TableIndex({
        name: "IDX_COMPANIES_CONTACT_ID",
        columnNames: ["contact_id"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.dropIndex("companies", "IDX_COMPANIES_CONTACT_ID");

    // Drop foreign key
    const table = await queryRunner.getTable("companies");
    const fk = table?.foreignKeys.find(
      (fk) =>
        fk.name === "FK_COMPANIES_CONTACT_ID" ||
        fk.columnNames.includes("contact_id")
    );
    if (fk) await queryRunner.dropForeignKey("companies", fk);

    // Drop column
    await queryRunner.dropColumn("companies", "contact_id");
  }
}
