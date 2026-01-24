import { profileTableName } from "@dike/common";
import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPlanIdToProfiles20251208130500 implements MigrationInterface {
  name = "AddPlanIdToProfiles20251208130500";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add nullable UUID column plan_id to align with entity relation
    await queryRunner.query(
      `ALTER TABLE "${profileTableName}" ADD COLUMN IF NOT EXISTS "plan_id" uuid NULL`
    );
    // Optional: if previous enum "plan" exists, keep it for now; no data migration performed here.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "${profileTableName}" DROP COLUMN IF EXISTS "plan_id"`
    );
  }
}
