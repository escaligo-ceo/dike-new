import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateAddressesPhonesEmailsTables20251220090500 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'address_type_enum') THEN CREATE TYPE address_type_enum AS ENUM ('HOME','WORK'); END IF; END $$;`
    );
    await queryRunner.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'phone_type_enum') THEN CREATE TYPE phone_type_enum AS ENUM ('HOME','WORK'); END IF; END $$;`
    );
    await queryRunner.query(
      `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_type_enum') THEN CREATE TYPE email_type_enum AS ENUM ('HOME','WORK'); END IF; END $$;`
    );

    // Addresses
    await queryRunner.createTable(
      new Table({
        name: "addresses",
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
          { name: "street", type: "varchar", length: "200", isNullable: false },
          { name: "street2", type: "varchar", length: "200", isNullable: true },
          { name: "city", type: "varchar", length: "100", isNullable: false },
          { name: "state", type: "varchar", length: "100", isNullable: true },
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
            name: "is_primary",
            type: "boolean",
            default: false,
            isNullable: false,
          },
          {
            name: "type",
            type: "address_type_enum",
            isNullable: false,
            default: `'HOME'`,
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
    await queryRunner.createForeignKey(
      "addresses",
      new TableForeignKey({
        columnNames: ["contact_id"],
        referencedTableName: "contacts",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );
    await queryRunner.createIndex(
      "addresses",
      new TableIndex({
        name: "IDX_ADDRESSES_TENANT_ID",
        columnNames: ["tenant_id"],
      })
    );
    await queryRunner.createIndex(
      "addresses",
      new TableIndex({
        name: "IDX_ADDRESSES_OWNER_ID",
        columnNames: ["owner_id"],
      })
    );
    await queryRunner.createIndex(
      "addresses",
      new TableIndex({
        name: "IDX_ADDRESSES_CONTACT_ID",
        columnNames: ["contact_id"],
      })
    );

    // Phones
    await queryRunner.createTable(
      new Table({
        name: "phones",
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
          { name: "number", type: "varchar", length: "30", isNullable: false },
          {
            name: "is_primary",
            type: "boolean",
            default: false,
            isNullable: false,
          },
          {
            name: "type",
            type: "phone_type_enum",
            isNullable: false,
            default: `'HOME'`,
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
      })
    );
    await queryRunner.createForeignKey(
      "phones",
      new TableForeignKey({
        columnNames: ["contact_id"],
        referencedTableName: "contacts",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );
    await queryRunner.createIndex(
      "phones",
      new TableIndex({
        name: "IDX_PHONES_TENANT_ID",
        columnNames: ["tenant_id"],
      })
    );
    await queryRunner.createIndex(
      "phones",
      new TableIndex({ name: "IDX_PHONES_OWNER_ID", columnNames: ["owner_id"] })
    );
    await queryRunner.createIndex(
      "phones",
      new TableIndex({
        name: "IDX_PHONES_CONTACT_ID",
        columnNames: ["contact_id"],
      })
    );

    // Emails
    await queryRunner.createTable(
      new Table({
        name: "emails",
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
          { name: "email", type: "varchar", length: "100", isNullable: false },
          {
            name: "is_primary",
            type: "boolean",
            default: false,
            isNullable: false,
          },
          {
            name: "type",
            type: "email_type_enum",
            isNullable: false,
            default: `'HOME'`,
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
      })
    );
    await queryRunner.createForeignKey(
      "emails",
      new TableForeignKey({
        columnNames: ["contact_id"],
        referencedTableName: "contacts",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );
    await queryRunner.createIndex(
      "emails",
      new TableIndex({
        name: "IDX_EMAILS_TENANT_ID",
        columnNames: ["tenant_id"],
      })
    );
    await queryRunner.createIndex(
      "emails",
      new TableIndex({ name: "IDX_EMAILS_OWNER_ID", columnNames: ["owner_id"] })
    );
    await queryRunner.createIndex(
      "emails",
      new TableIndex({
        name: "IDX_EMAILS_CONTACT_ID",
        columnNames: ["contact_id"],
      })
    );
    await queryRunner.createIndex(
      "emails",
      new TableIndex({ name: "IDX_EMAILS_EMAIL", columnNames: ["email"] })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("emails", "IDX_EMAILS_EMAIL");
    await queryRunner.dropIndex("emails", "IDX_EMAILS_CONTACT_ID");
    await queryRunner.dropIndex("emails", "IDX_EMAILS_OWNER_ID");
    await queryRunner.dropIndex("emails", "IDX_EMAILS_TENANT_ID");
    await queryRunner.dropTable("emails");

    await queryRunner.dropIndex("phones", "IDX_PHONES_CONTACT_ID");
    await queryRunner.dropIndex("phones", "IDX_PHONES_OWNER_ID");
    await queryRunner.dropIndex("phones", "IDX_PHONES_TENANT_ID");
    await queryRunner.dropTable("phones");

    await queryRunner.dropIndex("addresses", "IDX_ADDRESSES_CONTACT_ID");
    await queryRunner.dropIndex("addresses", "IDX_ADDRESSES_OWNER_ID");
    await queryRunner.dropIndex("addresses", "IDX_ADDRESSES_TENANT_ID");
    await queryRunner.dropTable("addresses");

    // Drop enum types
    await queryRunner.query(
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_type_enum') THEN DROP TYPE email_type_enum; END IF; END $$;`
    );
    await queryRunner.query(
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'phone_type_enum') THEN DROP TYPE phone_type_enum; END IF; END $$;`
    );
    await queryRunner.query(
      `DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'address_type_enum') THEN DROP TYPE address_type_enum; END IF; END $$;`
    );
  }
}
