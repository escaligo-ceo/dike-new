import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateImportDefinitionTable20251221103000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "import_definition",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "tenantId", type: "uuid", isNullable: false },
          { name: "owner_id", type: "uuid", isNullable: false },
          {
            name: "entityType",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          { name: "name", type: "varchar", length: "150", isNullable: false },
          { name: "description", type: "text", isNullable: true },
          {
            name: "mappingType",
            type: "varchar",
            length: "20",
            isNullable: false,
            default: `'path'`,
          },
          { name: "mappingRules", type: "jsonb", isNullable: false },
          { name: "version", type: "int", isNullable: false, default: 1 },
          {
            name: "isActive",
            type: "boolean",
            isNullable: false,
            default: true,
          },
          {
            name: "created_at",
            type: "timestamptz",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            isNullable: false,
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "import_definition",
      new TableIndex({
        name: "IDX_IMPORT_DEFINITION_TENANT_ENTITY",
        columnNames: ["tenantId", "entityType"],
      })
    );
    await queryRunner.createIndex(
      "import_definition",
      new TableIndex({
        name: "IDX_IMPORT_DEFINITION_OWNER",
        columnNames: ["owner_id"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      "import_definition",
      "IDX_IMPORT_DEFINITION_OWNER"
    );
    await queryRunner.dropIndex(
      "import_definition",
      "IDX_IMPORT_DEFINITION_TENANT_ENTITY"
    );
    await queryRunner.dropTable("import_definition");
  }
}
