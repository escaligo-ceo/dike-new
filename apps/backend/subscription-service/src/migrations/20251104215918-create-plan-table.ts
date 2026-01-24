import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePlanTable20251104215918 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "plans" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "key" varchar(255) NOT NULL UNIQUE,
        "name" varchar(255) NOT NULL,
        "description" text NOT NULL,
        "price_monthly" numeric(10,2) NOT NULL,
        "price_yearly" numeric(10,2) NOT NULL,
        "start_date" timestamptz DEFAULT CURRENT_TIMESTAMP,
        "end_date" timestamptz DEFAULT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "plans" CASCADE;');
  }
}
