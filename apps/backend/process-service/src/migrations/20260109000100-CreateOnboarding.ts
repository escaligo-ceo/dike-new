import { onboardingsTableName } from "@dike/common";
import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateOnboarding20260109000100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.hasTable(onboardingsTableName);
    if (!exists) {
      await queryRunner.createTable(
        new Table({
          name: onboardingsTableName,
          columns: [
            {
              name: "id",
              type: "int",
              isPrimary: true,
              isGenerated: true,
              generationStrategy: "increment",
            },
            {
              name: "userId",
              type: "varchar",
              length: "64",
              isNullable: false,
            },
            {
              name: "status",
              type: "varchar",
              length: "50",
              isNullable: false,
              default: "'pending'",
            },
            {
              name: "createdAt",
              type: "timestamp",
              default: "CURRENT_TIMESTAMP",
            },
            {
              name: "updatedAt",
              type: "timestamp",
              default: "CURRENT_TIMESTAMP",
              onUpdate: "CURRENT_TIMESTAMP",
            },
          ],
        }),
        true
      );

      await queryRunner.createIndex(
        onboardingsTableName,
        new TableIndex({
          name: "IDX_onboarding_userId",
          columnNames: ["userId"],
          isUnique: true,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.hasTable(onboardingsTableName);
    if (exists) {
      await queryRunner.dropIndex(
        onboardingsTableName,
        "IDX_onboarding_userId"
      );
      await queryRunner.dropTable(onboardingsTableName);
    }
  }
}
