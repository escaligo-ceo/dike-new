import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class AlterContactsTable20251220091000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns
    await queryRunner.addColumns("contacts", [
      new TableColumn({
        name: "company",
        type: "varchar",
        length: "100",
        isNullable: true,
      }),
      new TableColumn({ name: "notes", type: "text", isNullable: true }),
      new TableColumn({
        name: "custom_type",
        type: "varchar",
        length: "100",
        isNullable: true,
      }),
      new TableColumn({ name: "type_id", type: "uuid", isNullable: true }),
    ]);

    // Add FK to contact_types
    await queryRunner.createForeignKey(
      "contacts",
      new TableForeignKey({
        columnNames: ["type_id"],
        referencedTableName: "contact_types",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove FK
    const fks = await queryRunner.getTable("contacts");
    const fk = fks?.foreignKeys.find((fk) =>
      fk.columnNames.includes("type_id")
    );
    if (fk) await queryRunner.dropForeignKey("contacts", fk);

    // Drop added columns
    const newColumns = ["type_id", "custom_type", "notes", "company"];
    for (const name of newColumns) {
      const hasColumn = await queryRunner.hasColumn("contacts", name);
      if (hasColumn) await queryRunner.dropColumn("contacts", name);
    }

    // Recreate old columns (minimal definition)
    await queryRunner.addColumns("contacts", [
      new TableColumn({
        name: "email",
        type: "varchar",
        length: "100",
        isNullable: false,
      }),
      new TableColumn({
        name: "phone",
        type: "varchar",
        length: "15",
        isNullable: false,
      }),
      new TableColumn({
        name: "address",
        type: "varchar",
        length: "200",
        isNullable: false,
      }),
      new TableColumn({
        name: "city",
        type: "varchar",
        length: "100",
        isNullable: false,
      }),
      new TableColumn({
        name: "country",
        type: "varchar",
        length: "100",
        isNullable: false,
      }),
      new TableColumn({
        name: "postal_code",
        type: "varchar",
        length: "20",
        isNullable: false,
      }),
    ]);

    // Recreate index on email
    await queryRunner.query(
      `CREATE INDEX "IDX_CONTACTS_EMAIL" ON "contacts" ("email")`
    );
  }
}
