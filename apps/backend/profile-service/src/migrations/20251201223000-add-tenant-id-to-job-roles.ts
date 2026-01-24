import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTenantIdToJobRoles20251201223000 implements MigrationInterface {
  name = "AddTenantIdToJobRoles20251201223000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure tenant_id column exists on job_roles; use uuid to match Tenant.id
    // Create column if missing
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'job_roles' AND column_name = 'tenant_id'
        ) THEN
          ALTER TABLE job_roles ADD COLUMN tenant_id uuid NULL;
        END IF;
      END$$;
    `);

    // Add FK to tenant if not exists and tenant table is present
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'tenant'
        ) THEN
          IF NOT EXISTS (
            SELECT 1
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
             AND tc.table_name = kcu.table_name
            WHERE tc.table_name = 'job_roles'
              AND tc.constraint_type = 'FOREIGN KEY'
              AND kcu.column_name = 'tenant_id'
          ) THEN
            ALTER TABLE job_roles
            ADD CONSTRAINT job_roles_tenant_id_fk
            FOREIGN KEY (tenant_id) REFERENCES tenant(id) ON DELETE CASCADE;
          END IF;
        END IF;
      END$$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop FK if exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.table_constraints
          WHERE table_name = 'job_roles'
            AND constraint_name = 'job_roles_tenant_id_fk'
        ) THEN
          ALTER TABLE job_roles DROP CONSTRAINT job_roles_tenant_id_fk;
        END IF;
      END$$;
    `);

    // Drop column if exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'job_roles' AND column_name = 'tenant_id'
        ) THEN
          ALTER TABLE job_roles DROP COLUMN tenant_id;
        END IF;
      END$$;
    `);
  }
}
