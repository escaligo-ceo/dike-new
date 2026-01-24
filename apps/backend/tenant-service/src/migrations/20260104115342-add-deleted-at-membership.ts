import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAtMembership20260104115342 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "membership"
      ADD COLUMN "deleted_at" timestamptz NULL DEFAULT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "membership"
      DROP COLUMN "deleted_at";
    `);
  }
}
