import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuditEventsTable1695494400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_events" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "source" jsonb NOT NULL,
        "performedBy" varchar NOT NULL,
        "eventDate" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "eventType" varchar NOT NULL,
        "data" jsonb,
        "message" text
      );
    `);
    // Add comments conditionally for either camelCase (original) or snake_case (renamed) columns
    await queryRunner.query(`
      DO $$
      BEGIN
        -- source
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'audit_events' AND column_name = 'source'
        ) THEN
          COMMENT ON COLUMN "audit_events"."source" IS 'IP di origine della richiesta e user-agent';
        END IF;

        -- performedBy / performed_by
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'audit_events' AND column_name = 'performedBy'
        ) THEN
          COMMENT ON COLUMN "audit_events"."performedBy" IS 'The ID of the user who performed the action';
        ELSIF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'audit_events' AND column_name = 'performed_by'
        ) THEN
          COMMENT ON COLUMN "audit_events"."performed_by" IS 'The ID of the user who performed the action';
        END IF;

        -- eventDate / event_date
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'audit_events' AND column_name = 'eventDate'
        ) THEN
          COMMENT ON COLUMN "audit_events"."eventDate" IS 'Data e ora dell''evento di log';
        ELSIF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'audit_events' AND column_name = 'event_date'
        ) THEN
          COMMENT ON COLUMN "audit_events"."event_date" IS 'Data e ora dell''evento di log';
        END IF;

        -- eventType / event_type
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'audit_events' AND column_name = 'eventType'
        ) THEN
          COMMENT ON COLUMN "audit_events"."eventType" IS 'The name of the event, e.g., "user.created", "user.updated"';
        ELSIF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'audit_events' AND column_name = 'event_type'
        ) THEN
          COMMENT ON COLUMN "audit_events"."event_type" IS 'The name of the event, e.g., "user.created", "user.updated"';
        END IF;

        -- message
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'audit_events' AND column_name = 'message'
        ) THEN
          COMMENT ON COLUMN "audit_events"."message" IS 'A descriptive message about the event';
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "audit_events";
    `);
  }
}
