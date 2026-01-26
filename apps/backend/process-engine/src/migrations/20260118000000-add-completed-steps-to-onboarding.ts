import { onboardingsTableName } from "@dike/common";
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCompletedStepsToOnboarding20260118000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      onboardingsTableName,
      new TableColumn({
        name: "completed_steps",
        type: "text",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(onboardingsTableName, "completed_steps");
  }
}
