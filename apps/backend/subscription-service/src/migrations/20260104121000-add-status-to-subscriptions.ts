import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddStatusToSubscriptions20260104121000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("subscriptions");
    if (!table) {
      throw new Error("Table 'subscriptions' not found");
    }

    // Aggiungi la colonna status se non esiste già
    if (!table.findColumnByName("status")) {
      await queryRunner.addColumn(
        "subscriptions",
        new TableColumn({
          name: "status",
          type: "varchar",
          default: "'ACTIVE'",
          comment: "Stato dell'abbonamento",
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("subscriptions");
    if (!table) {
      throw new Error("Table 'subscriptions' not found");
    }

    // Rimuovi la colonna status se la migrazione viene annullata
    if (table.findColumnByName("status")) {
      await queryRunner.dropColumn("subscriptions", "status");
    }
  }
}
