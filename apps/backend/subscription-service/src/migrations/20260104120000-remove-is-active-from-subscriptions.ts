import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIsActiveFromSubscriptions20260104120000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("subscriptions");
    if (!table) {
      throw new Error("Table 'subscriptions' not found");
    }

    // Rimuove la colonna is_active poiché utilizziamo il soft delete pattern con deleted_at
    if (table.findColumnByName("is_active")) {
      await queryRunner.dropColumn("subscriptions", "is_active");
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("subscriptions");
    if (!table) {
      throw new Error("Table 'subscriptions' not found");
    }

    // Ripristina la colonna is_active se la migrazione viene annullata
    if (!table.findColumnByName("is_active")) {
      await queryRunner.query(
        'ALTER TABLE "subscriptions" ADD COLUMN "is_active" boolean NOT NULL DEFAULT true'
      );
    }
  }
}
