import { profileTableName } from "@dike/common";
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProfileFields1737890000000 implements MigrationInterface {
  name = "AddProfileFields1737890000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Aggiungi colonna job_role
    await queryRunner.query(`
      ALTER TABLE "${profileTableName}" 
      ADD COLUMN "job_role" integer NULL 
      COMMENT 'Codice numerico del ruolo professionale (0=Avvocato, 1=Praticante, 2=Assistente, 3=Amministratore di Sistema, 4=Custom)'
    `);

    // Aggiungi colonna job_role_text
    await queryRunner.query(`
      ALTER TABLE "${profileTableName}" 
      ADD COLUMN "job_role_text" character varying NULL
    `);

    // Aggiungi colonna plan_id
    await queryRunner.query(`
      ALTER TABLE "${profileTableName}" 
      ADD COLUMN "plan_id" uuid NULL 
      COMMENT 'ID del piano/abbonamento attivo dell''utente'
    `);

    // Aggiungi colonna last_completed_on_boarding_step
    await queryRunner.query(`
      ALTER TABLE "${profileTableName}" 
      ADD COLUMN "last_completed_on_boarding_step" integer NULL 
      COMMENT 'Ultimo step numerico della procedura di onboarding completato con successo'
    `);

    // Aggiungi colonna visibility con default
    await queryRunner.query(`
      ALTER TABLE "${profileTableName}" 
      ADD COLUMN "visibility" jsonb NULL DEFAULT '{}'::jsonb 
      COMMENT 'Mappa delle impostazioni di visibilità per i campi del profilo (es. fullName, email, jobTitle)'
    `);

    // Aggiungi foreign key per plan_id
    await queryRunner.query(`
      ALTER TABLE "${profileTableName}" 
      ADD CONSTRAINT "FK_profiles_plan_id" 
      FOREIGN KEY ("plan_id") 
      REFERENCES "plans"("id") 
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rimuovi foreign key
    await queryRunner.query(`
      ALTER TABLE "${profileTableName}" 
      DROP CONSTRAINT "FK_profiles_plan_id"
    `);

    // Rimuovi colonne
    await queryRunner.query(`
      ALTER TABLE "${profileTableName}" 
      DROP COLUMN "visibility"
    `);

    await queryRunner.query(`
      ALTER TABLE "${profileTableName}" 
      DROP COLUMN "last_completed_on_boarding_step"
    `);

    await queryRunner.query(`
      ALTER TABLE "${profileTableName}" 
      DROP COLUMN "plan_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "${profileTableName}" 
      DROP COLUMN "job_role_text"
    `);

    await queryRunner.query(`
      ALTER TABLE "${profileTableName}" 
      DROP COLUMN "job_role"
    `);
  }
}