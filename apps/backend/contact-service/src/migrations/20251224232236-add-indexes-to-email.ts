import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from "typeorm";

export class AddIndexesToEmail20251224232236 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "emails",
      new TableColumn({
        name: "is_preferred",
        type: "boolean",
        default: false,
      })
    );
    await queryRunner.addColumn(
      "emails",
      new TableColumn({
        name: "company_id",
        type: "uuid",
        isNullable: true,
      })
    );
    // Unique index: one preferred email per contact
    await queryRunner.createIndex(
      "emails",
      new TableIndex({
        name: "IDX_email_contact_preferred",
        columnNames: ["email", "contact_id", "is_preferred"],
        isUnique: true,
        where: '"is_preferred" = true',
      })
    );

    // Unique index: one preferred email per company
    await queryRunner.createIndex(
      "emails",
      new TableIndex({
        name: "IDX_email_company_preferred",
        columnNames: ["email", "company_id", "is_preferred"],
        isUnique: true,
        where: '"is_preferred" = true',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("emails", "IDX_email_company_preferred");
    await queryRunner.dropIndex("emails", "IDX_email_contact_preferred");
  }
}
