import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class AlterContactTypesAddContactId20251222182100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add contact_id column
    await queryRunner.addColumn(
      "contact_types",
      new TableColumn({ name: "contact_id", type: "uuid", isNullable: true })
    );

    // Add foreign key to contacts(id)
    await queryRunner.createForeignKey(
      "contact_types",
      new TableForeignKey({
        name: "FK_CONTACT_TYPES_CONTACT_ID",
        columnNames: ["contact_id"],
        referencedTableName: "contacts",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );

    // Add index on contact_id
    await queryRunner.createIndex(
      "contact_types",
      new TableIndex({
        name: "IDX_CONTACT_TYPES_CONTACT_ID",
        columnNames: ["contact_id"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.dropIndex(
      "contact_types",
      "IDX_CONTACT_TYPES_CONTACT_ID"
    );

    // Drop foreign key
    const table = await queryRunner.getTable("contact_types");
    const fk = table?.foreignKeys.find(
      (fk) =>
        fk.name === "FK_CONTACT_TYPES_CONTACT_ID" ||
        fk.columnNames.includes("contact_id")
    );
    if (fk) await queryRunner.dropForeignKey("contact_types", fk);

    // Drop column
    await queryRunner.dropColumn("contact_types", "contact_id");
  }
}
