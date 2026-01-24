import { profileTableName } from "@dike/common";
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOnboardingStepToUserProfiles20250828120000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${profileTableName}" ADD COLUMN "last_completed_on_boarding_step" integer NULL;`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "${profileTableName}"."last_completed_on_boarding_step" IS 'Ultimo step numerico della procedura di onboarding completato con successo.';`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "${profileTableName}" DROP COLUMN IF EXISTS "last_completed_on_boarding_step";
    `);
  }
}
