import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAtTenant20260103184833 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tenant"
      ADD COLUMN "deleted_at" timestamptz NULL DEFAULT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tenant"
      DROP COLUMN "deleted_at";
    `);
  }
}
