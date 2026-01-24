import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSubscriptionsTable20250831195200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenant_id" uuid NOT NULL,
        "plan_type" varchar(32) NOT NULL DEFAULT 'free',
        "start_date" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "end_date" timestamp,
        "is_active" boolean NOT NULL DEFAULT true
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "subscriptions" CASCADE;');
  }
}
