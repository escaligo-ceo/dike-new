import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddChatsToContact20251229140000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add chats column (JSONB array)
    await queryRunner.addColumn(
      "contacts",
      new TableColumn({
        name: "chats",
        type: "jsonb",
        isNullable: true,
        default: null,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the chats column
    await queryRunner.dropColumn("contacts", "chats");
  }
}
