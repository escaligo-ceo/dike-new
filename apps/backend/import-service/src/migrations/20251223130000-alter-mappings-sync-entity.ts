import { mappingsTableName } from "@dike/common";
import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from "typeorm";

export class AlterMappingsSyncEntity20251223130000 implements MigrationInterface {
  name = "AlterMappingsSyncEntity20251223130000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(mappingsTableName);
    if (!table) return;

    // Ensure sourceType column exists and is NOT NULL
    if (!table.columns.find((c) => c.name === "sourceType")) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: "sourceType",
          type: "varchar",
          length: "50",
          isNullable: false,
          comment: "Source system type, e.g., csv, json, vcf, etc.",
        })
      );
    } else {
      const sourceTypeColumn = table.columns.find(
        (c) => c.name === "sourceType"
      );
      if (sourceTypeColumn && sourceTypeColumn.isNullable) {
        await queryRunner.query(
          `UPDATE "${mappingsTableName}" SET "sourceType" = 'csv' WHERE "sourceType" IS NULL`
        );
        await queryRunner.query(
          `ALTER TABLE "${mappingsTableName}" ALTER COLUMN "sourceType" SET NOT NULL`
        );
      }
    }

    // Ensure entityType column exists as enum
    if (!table.columns.find((c) => c.name === "entityType")) {
      await queryRunner.query(
        `DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'import_type_enum') THEN
            CREATE TYPE "import_type_enum" AS ENUM('contact');
          END IF;
        END $$`
      );
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: "entityType",
          type: "enum",
          enum: ["contact"],
          isNullable: false,
          default: "'contact'",
        })
      );
    }

    // Ensure mappingType column exists as enum with default 'path'
    if (!table.columns.find((c) => c.name === "mappingType")) {
      await queryRunner.query(
        `DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'import_mapping_type_enum') THEN
            CREATE TYPE "import_mapping_type_enum" AS ENUM('path', 'jsonata');
          END IF;
        END $$`
      );
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: "mappingType",
          type: "enum",
          enum: ["path", "jsonata"],
          isNullable: false,
          default: "'path'",
        })
      );
    }

    // Ensure mappingRules column exists (rename from 'mapping' if needed, or create new)
    const hasMapping = !!table.columns.find((c) => c.name === "mapping");
    const hasMappingRules = !!table.columns.find(
      (c) => c.name === "mappingRules"
    );

    if (!hasMappingRules && !hasMapping) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: "mappingRules",
          type: "jsonb",
          isNullable: false,
          default: "'{}'",
        })
      );
    } else if (hasMapping && !hasMappingRules) {
      await queryRunner.renameColumn(
        mappingsTableName,
        "mapping",
        "mappingRules"
      );
    }

    // Ensure defaults column exists and is nullable
    if (!table.columns.find((c) => c.name === "defaults")) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: "defaults",
          type: "jsonb",
          isNullable: true,
          default: null,
        })
      );
    }

    // Ensure isActive column exists with default true
    if (!table.columns.find((c) => c.name === "isActive")) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: "isActive",
          type: "boolean",
          isNullable: false,
          default: true,
        })
      );
    }

    // Ensure created_at and updated_at columns exist
    if (!table.columns.find((c) => c.name === "created_at")) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: "created_at",
          type: "timestamptz",
          isNullable: false,
          default: "CURRENT_TIMESTAMP",
        })
      );
    }

    if (!table.columns.find((c) => c.name === "updated_at")) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: "updated_at",
          type: "timestamptz",
          isNullable: false,
          default: "CURRENT_TIMESTAMP",
        })
      );
    }

    // Ensure the index on tenantId and entityType exists
    const indexName = "IDX_mappings_tenant_entity";
    const hasIndex = table.indices.some((i) => i.name === indexName);
    if (!hasIndex) {
      await queryRunner.createIndex(
        table,
        new TableIndex({
          name: indexName,
          columnNames: ["tenantId", "entityType"],
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // For rollback, we'll keep the columns but note that full rollback
    // would require significant schema changes. This migration is primarily
    // for ensuring consistency, so down() is minimal.
    const table = await queryRunner.getTable(mappingsTableName);
    if (!table) return;

    // Remove the index if it exists
    const indexName = "IDX_mappings_tenant_entity";
    const hasIndex = table.indices.some((i) => i.name === indexName);
    if (hasIndex) {
      await queryRunner.dropIndex(table, indexName);
    }
  }
}
