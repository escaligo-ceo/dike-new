import { profileTableName } from "@dike/common";
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTenantIdToProfileTable20251108160000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "${profileTableName}"
      ADD COLUMN IF NOT EXISTS "tenant_id" uuid;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "${profileTableName}"
      DROP COLUMN IF EXISTS "tenant_id";
    `);
  }
}
