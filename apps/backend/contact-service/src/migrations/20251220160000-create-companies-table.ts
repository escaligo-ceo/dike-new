import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateCompaniesTable20251220160000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "companies",
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
          { name: "name", type: "varchar", length: "150", isNullable: false },
          {
            name: "department",
            type: "varchar",
            length: "150",
            isNullable: true,
          },
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
      "companies",
      new TableIndex({
        name: "IDX_COMPANIES_TENANT_ID",
        columnNames: ["tenant_id"],
      })
    );
    await queryRunner.createIndex(
      "companies",
      new TableIndex({
        name: "IDX_COMPANIES_OWNER_ID",
        columnNames: ["owner_id"],
      })
    );
    await queryRunner.createIndex(
      "companies",
      new TableIndex({ name: "IDX_COMPANIES_NAME", columnNames: ["name"] })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("companies", "IDX_COMPANIES_NAME");
    await queryRunner.dropIndex("companies", "IDX_COMPANIES_OWNER_ID");
    await queryRunner.dropIndex("companies", "IDX_COMPANIES_TENANT_ID");
    await queryRunner.dropTable("companies");
  }
}
