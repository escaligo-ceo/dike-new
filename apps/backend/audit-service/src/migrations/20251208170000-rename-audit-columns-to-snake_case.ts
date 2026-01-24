import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameAuditColumnsToSnakeCase20251208170000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure table exists; if not, create with expected snake_case schema
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_events'
        ) THEN
          CREATE TABLE "audit_events" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "source" jsonb NOT NULL,
            "performed_by" varchar NOT NULL,
            "event_date" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "event_type" varchar NOT NULL,
            "data" jsonb,
            "message" text
          );
        END IF;
      END
      $$;
    `);

    // Rename columns only if camelCase columns exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'audit_events' AND column_name = 'performedBy'
        ) THEN
          ALTER TABLE "audit_events" RENAME COLUMN "performedBy" TO "performed_by";
        END IF;
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'audit_events' AND column_name = 'eventDate'
        ) THEN
          ALTER TABLE "audit_events" RENAME COLUMN "eventDate" TO "event_date";
        END IF;
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'audit_events' AND column_name = 'eventType'
        ) THEN
          ALTER TABLE "audit_events" RENAME COLUMN "eventType" TO "event_type";
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert column names back to camelCase only if snake_case columns exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'audit_events' AND column_name = 'performed_by'
        ) THEN
          ALTER TABLE "audit_events" RENAME COLUMN "performed_by" TO "performedBy";
        END IF;
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'audit_events' AND column_name = 'event_date'
        ) THEN
          ALTER TABLE "audit_events" RENAME COLUMN "event_date" TO "eventDate";
        END IF;
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'audit_events' AND column_name = 'event_type'
        ) THEN
          ALTER TABLE "audit_events" RENAME COLUMN "event_type" TO "eventType";
        END IF;
      END
      $$;
    `);
  }
}
