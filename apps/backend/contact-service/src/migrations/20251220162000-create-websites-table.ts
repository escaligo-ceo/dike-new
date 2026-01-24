import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateWebsitesTable20251220162000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "websites",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "tenant_id", type: "uuid", isNullable: false },
          { name: "owner_id", type: "uuid", isNullable: true },
          { name: "contact_id", type: "uuid", isNullable: true },
          { name: "url", type: "varchar", length: "255", isNullable: false },
          { name: "label", type: "varchar", length: "100", isNullable: true },
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

    await queryRunner.createForeignKey(
      "websites",
      new TableForeignKey({
        columnNames: ["contact_id"],
        referencedTableName: "contacts",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );

    await queryRunner.createIndex(
      "websites",
      new TableIndex({
        name: "IDX_WEBSITES_TENANT_ID",
        columnNames: ["tenant_id"],
      })
    );
    await queryRunner.createIndex(
      "websites",
      new TableIndex({
        name: "IDX_WEBSITES_OWNER_ID",
        columnNames: ["owner_id"],
      })
    );
    await queryRunner.createIndex(
      "websites",
      new TableIndex({
        name: "IDX_WEBSITES_CONTACT_ID",
        columnNames: ["contact_id"],
      })
    );
    await queryRunner.createIndex(
      "websites",
      new TableIndex({ name: "IDX_WEBSITES_URL", columnNames: ["url"] })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("websites");
    const fk = table?.foreignKeys.find((fk) =>
      fk.columnNames.includes("contact_id")
    );
    if (fk) await queryRunner.dropForeignKey("websites", fk);

    await queryRunner.dropIndex("websites", "IDX_WEBSITES_URL");
    await queryRunner.dropIndex("websites", "IDX_WEBSITES_CONTACT_ID");
    await queryRunner.dropIndex("websites", "IDX_WEBSITES_OWNER_ID");
    await queryRunner.dropIndex("websites", "IDX_WEBSITES_TENANT_ID");

    await queryRunner.dropTable("websites");
  }
}
