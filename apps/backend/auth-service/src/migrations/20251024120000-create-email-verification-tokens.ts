import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateEmailVerificationTokens20251024120000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.createTable(
      new Table({
        name: "email_verification_tokens",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "email",
            type: "varchar",
            isNullable: false,
          },
          {
            name: "token",
            type: "varchar",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "expires_at",
            type: "timestamp",
            isNullable: false,
          },
          {
            name: "used",
            type: "boolean",
            isNullable: false,
            default: "false",
          },
          {
            name: "ip",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "user_agent",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            isNullable: false,
            default: "now()",
          },
        ],
      })
    );

    await queryRunner.createIndex(
      "email_verification_tokens",
      new TableIndex({
        name: "IDX_email_verification_email",
        columnNames: ["email"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("email_verification_tokens");
  }
}
