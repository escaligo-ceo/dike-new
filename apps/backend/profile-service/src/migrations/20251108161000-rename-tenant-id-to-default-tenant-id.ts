import { profileTableName } from "@dike/common";
import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTenantIdToDefaultTenantId20251108161000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "${profileTableName}"
      RENAME COLUMN "tenant_id" TO "default_tenant_id";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "${profileTableName}"
      RENAME COLUMN "default_tenant_id" TO "tenant_id";
    `);
  }
}
