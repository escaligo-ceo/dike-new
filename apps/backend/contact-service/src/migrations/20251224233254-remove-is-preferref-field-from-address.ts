import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIsPreferrefFieldFromAddress20251224233254 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the column
    const hasColumn = await queryRunner.hasColumn("addresses", "is_preferred");
    if (hasColumn) {
      await queryRunner.dropColumn("addresses", "is_preferred");
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore the column
    await queryRunner.query(`
      ALTER TABLE "addresses" 
      ADD COLUMN "is_preferred" boolean DEFAULT false
    `);

    // Restore the index
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_address_contact_preferred" 
      ON "addresses" ("email", "contact_id", "is_preferred") 
      WHERE "is_preferred" = true
    `);
  }
}
