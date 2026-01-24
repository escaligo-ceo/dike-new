import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFeatureTable20251104220102 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "features" (
        "id" varchar(255) PRIMARY KEY,
        "key" varchar NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text,
        "order" int NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "features" CASCADE;');
  }
}
