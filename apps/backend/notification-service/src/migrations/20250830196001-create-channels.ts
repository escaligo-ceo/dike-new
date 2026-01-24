import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateChannels20250830196001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'channel_type_enum') THEN
          CREATE TYPE channel_type_enum AS ENUM ('email', 'sms', 'telegram', 'whatsapp', 'system', 'slack', 'teams', 'other');
        END IF;
      END$$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "channels" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "type" channel_type_enum NOT NULL,
        "config" json,
        "is_active" boolean DEFAULT true,
        "deleted_at" timestamp NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "channels" CASCADE;');
    await queryRunner.query('DROP TYPE IF EXISTS channel_type_enum;');
  }
}
