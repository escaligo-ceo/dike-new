import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterContactsChangeDatesFormat20251225000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the old date columns
    const hasBirthday = await queryRunner.hasColumn("contacts", "birthday");
    const hasAnniversary = await queryRunner.hasColumn(
      "contacts",
      "anniversary"
    );

    if (hasBirthday) {
      await queryRunner.dropColumn("contacts", "birthday");
    }
    if (hasAnniversary) {
      await queryRunner.dropColumn("contacts", "anniversary");
    }

    // Add new varchar columns with MM-DD format
    await queryRunner.addColumns("contacts", [
      new TableColumn({
        name: "birthday",
        type: "varchar",
        length: "10",
        isNullable: true,
        comment: "Birthday in MM-DD format (e.g. 12-25)",
      }),
      new TableColumn({
        name: "anniversary",
        type: "varchar",
        length: "10",
        isNullable: true,
        comment: "Anniversary in MM-DD format (e.g. 12-25)",
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the varchar columns
    const hasBirthday = await queryRunner.hasColumn("contacts", "birthday");
    const hasAnniversary = await queryRunner.hasColumn(
      "contacts",
      "anniversary"
    );

    if (hasBirthday) {
      await queryRunner.dropColumn("contacts", "birthday");
    }
    if (hasAnniversary) {
      await queryRunner.dropColumn("contacts", "anniversary");
    }

    // Restore old date columns
    await queryRunner.addColumns("contacts", [
      new TableColumn({
        name: "birthday",
        type: "date",
        isNullable: true,
      }),
      new TableColumn({
        name: "anniversary",
        type: "date",
        isNullable: true,
      }),
    ]);
  }
}
