import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueDefaultJobRoleIndexes20251208125500
  implements MigrationInterface
{
  name = "AddUniqueDefaultJobRoleIndexes20251208125500";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Normalize existing data to satisfy uniqueness before creating indexes
    // 1) Standard roles (tenant_id IS NULL): keep a single default, unset others
    await queryRunner.query(`
      WITH defaults AS (
        SELECT id
        FROM job_roles
        WHERE is_default = true AND tenant_id IS NULL
        ORDER BY id ASC
      ), keep AS (
        SELECT id FROM defaults LIMIT 1
      )
      UPDATE job_roles jr
      SET is_default = false
      WHERE jr.tenant_id IS NULL AND jr.is_default = true AND jr.id NOT IN (SELECT id FROM keep);
    `);

    // 2) Tenant-specific roles: ensure at most one default per tenant
    await queryRunner.query(`
      WITH ranked AS (
        SELECT id, tenant_id,
               ROW_NUMBER() OVER (PARTITION BY tenant_id ORDER BY id ASC) as rn
        FROM job_roles
        WHERE is_default = true AND tenant_id IS NOT NULL
      )
      UPDATE job_roles jr
      SET is_default = false
      FROM ranked r
      WHERE jr.id = r.id AND r.rn > 1;
    `);

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS uniq_default_per_tenant ON job_roles (tenant_id, is_default)
       WHERE is_default = true AND tenant_id IS NOT NULL`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS uniq_default_standard ON job_roles (is_default)
       WHERE is_default = true AND tenant_id IS NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS uniq_default_per_tenant`);
    await queryRunner.query(`DROP INDEX IF EXISTS uniq_default_standard`);
  }
}
