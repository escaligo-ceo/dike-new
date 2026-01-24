import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateContactsTable20251120215221 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "contacts",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "tenant_id",
            type: "uuid",
            isNullable: false,
          },
          {
            name: "first_name",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "last_name",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "full_name",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "email",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "phone",
            type: "varchar",
            length: "15",
            isNullable: false,
          },
          {
            name: "address",
            type: "varchar",
            length: "200",
            isNullable: false,
          },
          {
            name: "city",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "country",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "postal_code",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "owner_id",
            type: "uuid",
            isNullable: false,
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
          {
            name: "deleted_at",
            type: "timestamp",
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Create indexes for better query performance
    await queryRunner.createIndex(
      "contacts",
      new TableIndex({
        name: "IDX_CONTACTS_TENANT_ID",
        columnNames: ["tenant_id"],
      })
    );

    await queryRunner.createIndex(
      "contacts",
      new TableIndex({
        name: "IDX_CONTACTS_OWNER_ID",
        columnNames: ["owner_id"],
      })
    );

    await queryRunner.createIndex(
      "contacts",
      new TableIndex({
        name: "IDX_CONTACTS_EMAIL",
        columnNames: ["email"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("contacts", "IDX_CONTACTS_EMAIL");
    await queryRunner.dropIndex("contacts", "IDX_CONTACTS_OWNER_ID");
    await queryRunner.dropIndex("contacts", "IDX_CONTACTS_TENANT_ID");
    await queryRunner.dropTable("contacts");
  }
}
