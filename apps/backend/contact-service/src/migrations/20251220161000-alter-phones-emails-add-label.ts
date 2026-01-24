import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterPhonesEmailsAddLabel20251220161000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add label to emails
    const hasEmailLabel = await queryRunner.hasColumn("emails", "label");
    if (!hasEmailLabel) {
      await queryRunner.addColumn(
        "emails",
        new TableColumn({
          name: "label",
          type: "varchar",
          length: "100",
          isNullable: true,
        })
      );
    }

    // Add label to phones
    const hasPhoneLabel = await queryRunner.hasColumn("phones", "label");
    if (!hasPhoneLabel) {
      await queryRunner.addColumn(
        "phones",
        new TableColumn({
          name: "label",
          type: "varchar",
          length: "100",
          isNullable: true,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove label from emails
    const hasEmailLabel = await queryRunner.hasColumn("emails", "label");
    if (hasEmailLabel) {
      await queryRunner.dropColumn("emails", "label");
    }

    // Remove label from phones
    const hasPhoneLabel = await queryRunner.hasColumn("phones", "label");
    if (hasPhoneLabel) {
      await queryRunner.dropColumn("phones", "label");
    }
  }
}
