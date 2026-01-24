import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateMappingsTable20251120194347 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "contact_import_mappings",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "gen_random_uuid()",
          },
          { name: "tenant_id", type: "uuid", isNullable: false },
          {
            name: "source_type",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          { name: "headers", type: "text", isArray: true, isNullable: false },
          {
            name: "header_normalized",
            type: "text",
            isArray: true,
            isNullable: false,
          },
          {
            name: "header_hash",
            type: "varchar",
            length: "128",
            isNullable: false,
          },
          {
            name: "header_hash_algorithm",
            type: "varchar",
            length: "20",
            isNullable: false,
            default: `'sha256'`,
          },
          {
            name: "field_mapping",
            type: "jsonb",
            isNullable: false,
            default: `'{}'`,
          },
          {
            name: "defaults",
            type: "jsonb",
            isNullable: true,
            default: `'{}'`,
          },
          { name: "version", type: "int", isNullable: false, default: 1 },
          {
            name: "created_at",
            type: "timestamp with time zone",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp with time zone",
            default: "now()",
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "contact_import_mappings",
      new TableIndex({
        name: "idx_contact_import_mappings_tenant_source_hash",
        columnNames: ["tenant_id", "source_type", "header_hash"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      "contact_import_mappings",
      "idx_contact_import_mappings_tenant_source_hash"
    );
    await queryRunner.dropTable("contact_import_mappings");
  }
}
