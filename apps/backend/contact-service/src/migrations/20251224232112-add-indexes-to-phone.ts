import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from "typeorm";

export class AddIndexesToPhone20251224232112 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "phones",
      new TableColumn({
        name: "is_preferred",
        type: "boolean",
        default: false,
      })
    );
    await queryRunner.addColumn(
      "phones",
      new TableColumn({
        name: "company_id",
        type: "uuid",
        isNullable: true,
      })
    );

    // Unique index: one preferred phone per contact
    await queryRunner.createIndex(
      "phones",
      new TableIndex({
        name: "IDX_phone_contact_preferred",
        columnNames: ["number", "contact_id", "is_preferred"],
        isUnique: true,
        where: '"is_preferred" = true',
      })
    );

    // Unique index: one preferred phone per company
    await queryRunner.createIndex(
      "phones",
      new TableIndex({
        name: "IDX_phone_company_preferred",
        columnNames: ["number", "company_id", "is_preferred"],
        isUnique: true,
        where: '"is_preferred" = true',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("phones", "IDX_phone_company_preferred");
    await queryRunner.dropIndex("phones", "IDX_phone_contact_preferred");
  }
}
