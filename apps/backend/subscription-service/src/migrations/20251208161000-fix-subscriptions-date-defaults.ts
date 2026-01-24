import { MigrationInterface, QueryRunner } from "typeorm";

export class FixSubscriptionsDateDefaults20251208161000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "subscriptions"
      ALTER COLUMN "start_date" SET DEFAULT CURRENT_TIMESTAMP,
      ALTER COLUMN "start_date" SET NOT NULL,
      ALTER COLUMN "end_date" DROP NOT NULL,
      ALTER COLUMN "end_date" DROP DEFAULT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "subscriptions"
      ALTER COLUMN "start_date" DROP DEFAULT,
      ALTER COLUMN "end_date" SET NOT NULL;
    `);
  }
}
