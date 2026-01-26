import { OnboardingPages, onboardingsTableName, OnboardingStatus } from "@dike/common";
import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOnboardingSteps20260117093444 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crea il tipo enum per gli step di onboarding
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE onboarding_step_enum AS ENUM (
          'NOT_STARTED',
          'STARTED',
          'USER_CREATION',
          '${OnboardingPages.PROFILE_CREATION}',
          '${OnboardingPages.TENANT_CREATION}',
          '${OnboardingPages.OFFICE_CREATION}',
          '${OnboardingPages.TEAM_CREATION}',
          'ASSIGN_SUBSCRIPTION',
          'SEND_INVITATIONS',
          'COMPLETED',
          'FAILED'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Aggiungi la colonna error
    await queryRunner.query(`
      ALTER TABLE ${onboardingsTableName}
      ADD COLUMN IF NOT EXISTS error TEXT NULL;
    `);

    // 3. Rinomina la colonna status in step (se esiste)
    const hasStatusColumn = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${onboardingsTableName}' 
      AND column_name = 'status';
    `);

    if (hasStatusColumn.length > 0) {
      // 3a. Crea una colonna temporanea con il tipo enum
      await queryRunner.query(`
        ALTER TABLE ${onboardingsTableName}
        ADD COLUMN step_temp onboarding_step_enum;
      `);

      // 3b. Mappa i vecchi valori ai nuovi
      await queryRunner.query(`
        UPDATE ${onboardingsTableName}
        SET step_temp = CASE
          WHEN status = 'pending' THEN 'NOT_STARTED'::onboarding_step_enum
          WHEN status = 'STARTED' THEN 'STARTED'::onboarding_step_enum
          WHEN status = '${OnboardingStatus.USER_CREATED}' THEN '${OnboardingPages.USER_CREATION}'::onboarding_step_enum
          WHEN status = '${OnboardingStatus.PROFILE_CREATED}' THEN '${OnboardingPages.PROFILE_CREATION}'::onboarding_step_enum
          WHEN status = '${OnboardingStatus.TENANT_CREATED}' THEN '${OnboardingPages.TENANT_CREATION}'::onboarding_step_enum
          WHEN status = '${OnboardingStatus.TEAM_CREATED}' THEN '${OnboardingPages.TEAM_CREATION}'::onboarding_step_enum
          WHEN status = '${OnboardingStatus.OFFICE_CREATED}' THEN '${OnboardingPages.OFFICE_CREATION}'::onboarding_step_enum
          WHEN status = 'SUBSCRIPTION_ASSIGNED' THEN 'ASSIGN_SUBSCRIPTION'::onboarding_step_enum
          WHEN status = 'COMPLETED' THEN 'COMPLETED'::onboarding_step_enum
          WHEN status = 'FAILED' THEN 'FAILED'::onboarding_step_enum
          ELSE 'NOT_STARTED'::onboarding_step_enum
        END;
      `);

      // 3c. Elimina la vecchia colonna status
      await queryRunner.query(`
        ALTER TABLE ${onboardingsTableName}
        DROP COLUMN status;
      `);

      // 3d. Rinomina step_temp in step
      await queryRunner.query(`
        ALTER TABLE ${onboardingsTableName}
        RENAME COLUMN step_temp TO step;
      `);

      // 3e. Imposta il default per la colonna step
      await queryRunner.query(`
        ALTER TABLE ${onboardingsTableName}
        ALTER COLUMN step SET DEFAULT 'STARTED'::onboarding_step_enum;
      `);

      // 3f. Imposta NOT NULL
      await queryRunner.query(`
        ALTER TABLE ${onboardingsTableName}
        ALTER COLUMN step SET NOT NULL;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Rinomina step in status e converti da enum a varchar
    const hasStepColumn = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = '${onboardingsTableName}' 
      AND column_name = 'step';
    `);

    if (hasStepColumn.length > 0) {
      // 1a. Crea colonna temporanea varchar
      await queryRunner.query(`
        ALTER TABLE ${onboardingsTableName}
        ADD COLUMN status_temp VARCHAR(50);
      `);

      // 1b. Mappa i valori enum ai vecchi valori stringa
      await queryRunner.query(`
        UPDATE ${onboardingsTableName}
        SET status_temp = CASE
          WHEN step = 'NOT_STARTED' THEN 'pending'
          WHEN step = 'STARTED' THEN 'STARTED'
          WHEN step = '${OnboardingPages.USER_CREATION}' THEN '${OnboardingStatus.USER_CREATED}'
          WHEN step = '${OnboardingPages.PROFILE_CREATION}' THEN '${OnboardingStatus.PROFILE_CREATED}'
          WHEN step = '${OnboardingPages.TENANT_CREATION}' THEN '${OnboardingStatus.TENANT_CREATED}'
          WHEN step = '${OnboardingPages.TEAM_CREATION}' THEN '${OnboardingStatus.TEAM_CREATED}'
          WHEN step = '${OnboardingPages.OFFICE_CREATION}' THEN '${OnboardingStatus.OFFICE_CREATED}'
          WHEN step = 'ASSIGN_SUBSCRIPTION' THEN 'SUBSCRIPTION_ASSIGNED'
          WHEN step = 'COMPLETED' THEN 'COMPLETED'
          WHEN step = 'FAILED' THEN 'FAILED'
          ELSE 'pending'
        END;
      `);

      // 1c. Elimina la colonna step
      await queryRunner.query(`
        ALTER TABLE ${onboardingsTableName}
        DROP COLUMN step;
      `);

      // 1d. Rinomina status_temp in status
      await queryRunner.query(`
        ALTER TABLE ${onboardingsTableName}
        RENAME COLUMN status_temp TO status;
      `);

      // 1e. Imposta default e NOT NULL
      await queryRunner.query(`
        ALTER TABLE ${onboardingsTableName}
        ALTER COLUMN status SET DEFAULT 'pending';
      `);

      await queryRunner.query(`
        ALTER TABLE ${onboardingsTableName}
        ALTER COLUMN status SET NOT NULL;
      `);
    }

    // 2. Rimuovi la colonna error
    await queryRunner.query(`
      ALTER TABLE ${onboardingsTableName}
      DROP COLUMN IF EXISTS error;
    `);

    // 3. Elimina il tipo enum
    await queryRunner.query(`
      DROP TYPE IF EXISTS onboarding_step_enum;
    `);
  }
}
