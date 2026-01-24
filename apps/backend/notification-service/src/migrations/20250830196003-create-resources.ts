import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateResources20250830196003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_type_enum') THEN
          CREATE TYPE resource_type_enum AS ENUM ('HTML', 'TEXT', 'SUBJECT');
        END IF;
      END$$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "resources" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "template_id" uuid NOT NULL,
        "type" resource_type_enum NOT NULL,
        "name" varchar NOT NULL,
        "filename" varchar NOT NULL,
        CONSTRAINT "FK_resource_template" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "resources" CASCADE;');
    await queryRunner.query('DROP TYPE IF EXISTS resource_type_enum;');
  }
}
