import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterSubscriptionsRenameColumns20260104111348 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("subscriptions");
    if (!table) {
      throw new Error("Table 'subscriptions' not found");
    }

    // Rinomina start_date in since
    if (table.findColumnByName("start_date")) {
      await queryRunner.renameColumn("subscriptions", "start_date", "since");
    }

    // Rinomina end_date in to
    if (table.findColumnByName("end_date")) {
      await queryRunner.renameColumn("subscriptions", "end_date", "to");
    }

    // Assicurati che le colonne siano del tipo corretto (timestamptz)
    const sinceColumn = table.findColumnByName("since");
    if (sinceColumn && sinceColumn.type !== "timestamptz") {
      await queryRunner.changeColumn(
        "subscriptions",
        sinceColumn,
        new TableColumn({
          name: "since",
          type: "timestamptz",
          default: "CURRENT_TIMESTAMP",
          comment: "Data di inizio dell'abbonamento",
        })
      );
    }

    const toColumn = table.findColumnByName("to");
    if (toColumn && toColumn.type !== "timestamptz") {
      await queryRunner.changeColumn(
        "subscriptions",
        toColumn,
        new TableColumn({
          name: "to",
          type: "timestamptz",
          isNullable: true,
          default: null,
          comment: "Data di fine dell'abbonamento",
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("subscriptions");
    if (!table) {
      throw new Error("Table 'subscriptions' not found");
    }

    // Rinomina since in start_date
    if (table.findColumnByName("since")) {
      await queryRunner.renameColumn("subscriptions", "since", "start_date");
    }

    // Rinomina to in end_date
    if (table.findColumnByName("to")) {
      await queryRunner.renameColumn("subscriptions", "to", "end_date");
    }

    // Ripristina i tipi originali
    const startDateColumn = table.findColumnByName("start_date");
    if (startDateColumn && startDateColumn.type !== "timestamp") {
      await queryRunner.changeColumn(
        "subscriptions",
        startDateColumn,
        new TableColumn({
          name: "start_date",
          type: "timestamp",
          default: "CURRENT_TIMESTAMP",
        })
      );
    }

    const endDateColumn = table.findColumnByName("end_date");
    if (endDateColumn && endDateColumn.type !== "timestamp") {
      await queryRunner.changeColumn(
        "subscriptions",
        endDateColumn,
        new TableColumn({
          name: "end_date",
          type: "timestamp",
          isNullable: true,
        })
      );
    }
  }
}
