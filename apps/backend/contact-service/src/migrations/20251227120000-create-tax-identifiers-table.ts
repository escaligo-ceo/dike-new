import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateTaxIdentifiersTable20251227120000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "tax_identifiers",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "contact_id",
            type: "uuid",
            isNullable: true,
          },
          {
            name: "type",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "value",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp with time zone",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp with time zone",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "deleted_at",
            type: "timestamp with time zone",
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Add foreign key for contact_id
    await queryRunner.createForeignKey(
      "tax_identifiers",
      new TableForeignKey({
        columnNames: ["contact_id"],
        referencedTableName: "contacts",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );

    // Add index on contact_id
    await queryRunner.createIndex(
      "tax_identifiers",
      new TableIndex({
        name: "IDX_tax_identifiers_contact_id",
        columnNames: ["contact_id"],
      })
    );

    // Add unique index on contact_id, type, and value
    await queryRunner.createIndex(
      "tax_identifiers",
      new TableIndex({
        name: "IDX_tax_identifiers_contact_type_value",
        columnNames: ["contact_id", "type", "value"],
        isUnique: true,
        where: '"deleted_at" IS NULL',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    const table = await queryRunner.getTable("tax_identifiers");
    const idxContactId = table?.indices.find(
      (idx) => idx.name === "IDX_tax_identifiers_contact_id"
    );
    const idxContactTypeValue = table?.indices.find(
      (idx) => idx.name === "IDX_tax_identifiers_contact_type_value"
    );

    if (idxContactId) {
      await queryRunner.dropIndex("tax_identifiers", idxContactId);
    }
    if (idxContactTypeValue) {
      await queryRunner.dropIndex("tax_identifiers", idxContactTypeValue);
    }

    // Drop foreign key
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames[0] === "contact_id"
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey("tax_identifiers", foreignKey);
    }

    // Drop table
    await queryRunner.dropTable("tax_identifiers");
  }
}
