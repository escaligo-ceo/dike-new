import { mappingsTableName } from "@dike/common";
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableIndex,
} from "typeorm";

export class CleanupMappingTables20251221120000 implements MigrationInterface {
  name = "CleanupMappingTables20251221120000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure uuid extension (still via raw query as TypeORM lacks API for extensions)
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Drop legacy tables if they exist using TypeORM API
    await queryRunner.dropTable(mappingsTableName, true, true);
    await queryRunner.dropTable("csv_mappings", true, true);

    // Ensure import_definition table matches Mapping entity
    const importDef = await queryRunner.getTable("import_definition");
    if (!importDef) {
      await queryRunner.createTable(
        new Table({
          name: "import_definition",
          columns: [
            {
              name: "id",
              type: "uuid",
              isPrimary: true,
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
            { name: "version", type: "int", isNullable: false, default: 1 },
            { name: "headers", type: "text", isArray: true, isNullable: false },
            {
              name: "headerNormalized",
              type: "text",
              isArray: true,
              isNullable: false,
            },
            { name: "headerHash", type: "text", isNullable: false },
            { name: "headerHashAlgorithm", type: "text", isNullable: false },
            {
              name: "mappingType",
              type: "varchar",
              length: "20",
              isNullable: false,
              default: "'path'",
            },
            { name: "mappingRules", type: "jsonb", isNullable: false },
            {
              name: "defaults",
              type: "jsonb",
              isNullable: true,
              default: null,
            },
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
    } else {
      const ensureColumn = async (name: string, col: TableColumn) => {
        if (!importDef.columns.find((c) => c.name === name)) {
          await queryRunner.addColumn(importDef, col);
        }
      };
      await ensureColumn(
        "tenantId",
        new TableColumn({ name: "tenantId", type: "uuid" })
      );
      await ensureColumn(
        "owner_id",
        new TableColumn({ name: "owner_id", type: "uuid" })
      );
      await ensureColumn(
        "entityType",
        new TableColumn({ name: "entityType", type: "varchar", length: "50" })
      );
      await ensureColumn(
        "name",
        new TableColumn({ name: "name", type: "varchar", length: "150" })
      );
      await ensureColumn(
        "description",
        new TableColumn({ name: "description", type: "text", isNullable: true })
      );
      await ensureColumn(
        "version",
        new TableColumn({ name: "version", type: "int", default: "1" })
      );
      await ensureColumn(
        "headers",
        new TableColumn({ name: "headers", type: "text", isArray: true })
      );
      await ensureColumn(
        "headerNormalized",
        new TableColumn({
          name: "headerNormalized",
          type: "text",
          isArray: true,
        })
      );
      await ensureColumn(
        "headerHash",
        new TableColumn({ name: "headerHash", type: "text" })
      );
      await ensureColumn(
        "headerHashAlgorithm",
        new TableColumn({ name: "headerHashAlgorithm", type: "text" })
      );
      await ensureColumn(
        "mappingType",
        new TableColumn({
          name: "mappingType",
          type: "varchar",
          length: "20",
          default: "'path'",
        })
      );
      await ensureColumn(
        "mappingRules",
        new TableColumn({ name: "mappingRules", type: "jsonb" })
      );
      await ensureColumn(
        "defaults",
        new TableColumn({
          name: "defaults",
          type: "jsonb",
          isNullable: true,
          default: "NULL",
        })
      );
      await ensureColumn(
        "isActive",
        new TableColumn({ name: "isActive", type: "boolean", default: "true" })
      );
      await ensureColumn(
        "created_at",
        new TableColumn({
          name: "created_at",
          type: "timestamptz",
          default: "CURRENT_TIMESTAMP",
        })
      );
      await ensureColumn(
        "updated_at",
        new TableColumn({
          name: "updated_at",
          type: "timestamptz",
          default: "CURRENT_TIMESTAMP",
        })
      );

      const idxNames = importDef.indices.map((i) => i.name).filter(Boolean);
      if (!idxNames.includes("IDX_IMPORT_DEFINITION_TENANT_ENTITY")) {
        await queryRunner.createIndex(
          importDef,
          new TableIndex({
            name: "IDX_IMPORT_DEFINITION_TENANT_ENTITY",
            columnNames: ["tenantId", "entityType"],
          })
        );
      }
      if (!idxNames.includes("IDX_IMPORT_DEFINITION_OWNER")) {
        await queryRunner.createIndex(
          importDef,
          new TableIndex({
            name: "IDX_IMPORT_DEFINITION_OWNER",
            columnNames: ["owner_id"],
          })
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert schema changes on mappings via TypeORM API
    const mappingsTable = await queryRunner.getTable(mappingsTableName);
    if (mappingsTable) {
      const existingIndexes = mappingsTable.indices
        .map((i) => i.name)
        .filter(Boolean);
      if (existingIndexes.includes("IDX_mappings_tenant_source")) {
        await queryRunner.dropIndex(
          mappingsTable,
          "IDX_mappings_tenant_source"
        );
      }
      if (existingIndexes.includes("IDX_mappings_headerHash")) {
        await queryRunner.dropIndex(mappingsTable, "IDX_mappings_headerHash");
      }
      if (existingIndexes.includes("IDX_mappings_ownerId")) {
        await queryRunner.dropIndex(mappingsTable, "IDX_mappings_ownerId");
      }
      if (mappingsTable.columns.find((c) => c.name === "description")) {
        await queryRunner.dropColumn(mappingsTable, "description");
      }
      // Note: do not drop ownerId column; earlier migrations may rely on it.
    }

    // Recreate legacy tables to allow rollback (TypeORM API)
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Recreate mappings (legacy)
    await queryRunner.createTable(
      new Table({
        name: mappingsTableName,
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "uuid_generate_v4()",
          },
          { name: "name", type: "varchar", length: "255", isNullable: false },
          { name: "version", type: "int", isNullable: false, default: 1 },
          { name: "tenantId", type: "uuid", isNullable: false },
          {
            name: "sourceType",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          { name: "headers", type: "text", isArray: true, isNullable: false },
          {
            name: "headerNormalized",
            type: "text",
            isArray: true,
            isNullable: false,
          },
          { name: "headerHash", type: "text", isNullable: false },
          { name: "headerHashAlgorithm", type: "text", isNullable: false },
          { name: "mapping", type: "jsonb", isNullable: false },
          { name: "defaults", type: "jsonb", isNullable: true },
          {
            name: "created_at",
            type: "timestamptz",
            isNullable: false,
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            isNullable: false,
            default: "now()",
          },
          { name: "ownerId", type: "uuid", isNullable: true },
        ],
      }),
      true
    );
    await queryRunner.createIndex(
      mappingsTableName,
      new TableIndex({
        name: "IDX_mappings_headerHash",
        columnNames: ["headerHash"],
      })
    );

    // Recreate csv_mappings (legacy)
    await queryRunner.createTable(
      new Table({
        name: "csv_mappings",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "uuid_generate_v4()",
          },
          {
            name: "tenantId",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "entityType",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          { name: "mapping", type: "jsonb", isNullable: false },
          {
            name: "isDefault",
            type: "boolean",
            isNullable: false,
            default: false,
          },
          {
            name: "createdAt",
            type: "timestamptz",
            isNullable: false,
            default: "now()",
          },
          {
            name: "updatedAt",
            type: "timestamptz",
            isNullable: false,
            default: "now()",
          },
        ],
      }),
      true
    );
    await queryRunner.createIndex(
      "csv_mappings",
      new TableIndex({
        name: "idx_csv_mappings_tenant_entity",
        columnNames: ["tenantId", "entityType"],
      })
    );
    await queryRunner.createIndex(
      "csv_mappings",
      new TableIndex({
        name: "idx_csv_mappings_default",
        columnNames: ["isDefault"],
      })
    );
    await queryRunner.createIndex(
      "csv_mappings",
      new TableIndex({
        name: "uniq_csv_mappings_default_per_tenant_entity",
        columnNames: ["tenantId", "entityType"],
        isUnique: true,
        where: '"isDefault" = true',
      })
    );

    // Optionally drop import_definition to fully revert
    await queryRunner.dropTable("import_definition", true, true);
  }
}
