import { profileTableName } from "@dike/common";
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlanToUserProfiles20250822090000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crea il tipo enum Plans in Postgres
    await queryRunner.query(`CREATE TYPE "plans_enum" AS ENUM ('free', 'pro', 'business', 'premium');`);
    // Aggiungi la colonna plan come enum
    await queryRunner.query(`ALTER TABLE "${profileTableName}" ADD COLUMN "plan" "plans_enum" NULL;`);
    // (opzionale) commento sulla colonna
    await queryRunner.query(`COMMENT ON COLUMN "${profileTableName}"."plan" IS 'Piano/abbonamento attivo dell’utente (es. FREE, PRO, BUSINESS, PREMIUM)';`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "${profileTableName}" DROP COLUMN IF EXISTS "plan";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "plans_enum";`);
  }
}
