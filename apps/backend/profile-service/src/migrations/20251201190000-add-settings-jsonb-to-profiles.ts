import { profileTableName } from "@dike/common";
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSettingsJsonbToProfiles20251201190000
  implements MigrationInterface
{
  name = "AddSettingsJsonbToProfiles20251201190000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add a jsonb column `settings` with default empty object
    await queryRunner.query(
      `ALTER TABLE "${profileTableName}" ADD COLUMN "visibility" jsonb NOT NULL DEFAULT '{}'::jsonb`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "${profileTableName}" DROP COLUMN "visibility"`);
  }
}
