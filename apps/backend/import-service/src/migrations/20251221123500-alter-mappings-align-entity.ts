import { mappingsTableName } from "@dike/common";
import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from "typeorm";

export class AlterMappingsAlignEntity20251221123500 implements MigrationInterface {
  name = "AlterMappingsAlignEntity20251221123500";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure uuid extension (raw, no TypeORM API)
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    const table = await queryRunner.getTable(mappingsTableName);
    if (!table) return;

    // Rename ownerId -> owner_id if present
    const hasOwnerId = !!table.columns.find((c) => c.name === "ownerId");
    const hasOwner_snake = !!table.columns.find((c) => c.name === "owner_id");
    if (hasOwnerId && !hasOwner_snake) {
      await queryRunner.renameColumn(mappingsTableName, "ownerId", "owner_id");
    }

    // Add entityType (varchar) if missing
    if (!table.columns.find((c) => c.name === "entityType")) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: "entityType",
          type: "varchar",
          length: "50",
          isNullable: false,
          default: "'contact'",
        })
      );
    }

    // Add mappingType (varchar) if missing
    if (!table.columns.find((c) => c.name === "mappingType")) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: "mappingType",
          type: "varchar",
          length: "20",
          isNullable: false,
          default: "'path'",
        })
      );
    }

    // Add isActive (boolean) if missing
    if (!table.columns.find((c) => c.name === "isActive")) {
      await queryRunner.addColumn(
        table,
        new TableColumn({
          name: "isActive",
          type: "boolean",
          isNullable: false,
          default: true as any,
        })
      );
    }

    // Index updates: drop tenant+sourceType index if exists, add tenant+entityType
    const idxNames = table.indices.map((i) => i.name).filter(Boolean);
    if (idxNames.includes("IDX_mappings_tenant_source")) {
      await queryRunner.dropIndex(table, "IDX_mappings_tenant_source");
    }
    if (!idxNames.includes("IDX_mappings_tenant_entity")) {
      await queryRunner.createIndex(
        table,
        new TableIndex({
          name: "IDX_mappings_tenant_entity",
          columnNames: ["tenantId", "entityType"],
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(mappingsTableName);
    if (!table) return;

    // Revert index change
    const idxNames = table.indices.map((i) => i.name).filter(Boolean);
    if (idxNames.includes("IDX_mappings_tenant_entity")) {
      await queryRunner.dropIndex(table, "IDX_mappings_tenant_entity");
    }
    if (!idxNames.includes("IDX_mappings_tenant_source")) {
      await queryRunner.createIndex(
        table,
        new TableIndex({
          name: "IDX_mappings_tenant_source",
          columnNames: ["tenantId", "sourceType"],
        })
      );
    }

    // Remove isActive/mappingType/entityType if present
    if (table.columns.find((c) => c.name === "isActive")) {
      await queryRunner.dropColumn(table, "isActive");
    }
    if (table.columns.find((c) => c.name === "mappingType")) {
      await queryRunner.dropColumn(table, "mappingType");
    }
    if (table.columns.find((c) => c.name === "entityType")) {
      await queryRunner.dropColumn(table, "entityType");
    }

    // Rename owner_id back to ownerId if present
    const hasOwnerSnake = !!table.columns.find((c) => c.name === "owner_id");
    const hasOwnerCamel = !!table.columns.find((c) => c.name === "ownerId");
    if (hasOwnerSnake && !hasOwnerCamel) {
      await queryRunner.renameColumn(mappingsTableName, "owner_id", "ownerId");
    }
  }
}
