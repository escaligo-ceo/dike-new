import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateContactTypesTable20251220090000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "contact_types",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "tenant_id", type: "uuid", isNullable: false },
          { name: "owner_id", type: "uuid", isNullable: false },
          { name: "name", type: "varchar", length: "100", isNullable: false },
          { name: "description", type: "text", isNullable: true },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          { name: "deleted_at", type: "timestamp", isNullable: true },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "contact_types",
      new TableIndex({
        name: "IDX_CONTACT_TYPES_TENANT_ID",
        columnNames: ["tenant_id"],
      })
    );
    await queryRunner.createIndex(
      "contact_types",
      new TableIndex({
        name: "IDX_CONTACT_TYPES_OWNER_ID",
        columnNames: ["owner_id"],
      })
    );
    await queryRunner.createIndex(
      "contact_types",
      new TableIndex({ name: "IDX_CONTACT_TYPES_NAME", columnNames: ["name"] })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("contact_types", "IDX_CONTACT_TYPES_NAME");
    await queryRunner.dropIndex("contact_types", "IDX_CONTACT_TYPES_OWNER_ID");
    await queryRunner.dropIndex("contact_types", "IDX_CONTACT_TYPES_TENANT_ID");
    await queryRunner.dropTable("contact_types");
  }
}
