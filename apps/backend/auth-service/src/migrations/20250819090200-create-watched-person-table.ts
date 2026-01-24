import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateWatchedPersonTable20250819090200
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "watched_persons",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          { name: "first_name", type: "varchar" },
          { name: "last_name", type: "varchar" },
          { name: "email", type: "varchar", isNullable: true },
          { name: "notes", type: "text", isNullable: true },
          { name: "registered", type: "boolean", default: false },
          { name: "registered_at", type: "timestamp", isNullable: true },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            onUpdate: "CURRENT_TIMESTAMP",
          },
          {
            name: "deleted_at",
            type: "timestamp",
            isNullable: true,
          },
        ],
        indices: [
          {
            name: "IDX_WATCHED_PERSONS_NAME",
            columnNames: ["first_name", "last_name"],
          },
          { name: "IDX_WATCHED_PERSONS_EMAIL", columnNames: ["email"] },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("watched_persons");
  }
}
