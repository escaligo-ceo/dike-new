import { onboardingsTableName } from "@dike/common";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class UniqueUserIdAndRename20260110214000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table: Table | undefined = await queryRunner.getTable(onboardingsTableName);
    if (!table) return;

    const userIdCol = table.findColumnByName("userId");
    const user_idCol = table.findColumnByName("user_id");

    // Rename userId -> user_id if needed
    if (userIdCol && !user_idCol) {
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" RENAME COLUMN "userId" TO "user_id";`
      );
    }

    // Add UNIQUE constraint on user_id
    const uniqueConstraintName = "UQ_onboardings_user_id";
    const existingUniques = table.uniques || [];
    const hasUnique = existingUniques.some((u) =>
      u.columnNames.includes("user_id")
    );
    if (!hasUnique) {
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" ADD CONSTRAINT "${uniqueConstraintName}" UNIQUE ("user_id");`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table: Table | undefined = await queryRunner.getTable(onboardingsTableName);
    if (!table) return;

    // Drop UNIQUE constraint on user_id
    const uniqueConstraintName = "UQ_onboardings_user_id";
    await queryRunner.query(
      `ALTER TABLE "${onboardingsTableName}" DROP CONSTRAINT IF EXISTS "${uniqueConstraintName}";`
    );

    // Rename user_id -> userId back if needed
    const user_idCol = table.findColumnByName("user_id");
    const userIdCol = table.findColumnByName("userId");
    if (user_idCol && !userIdCol) {
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" RENAME COLUMN "user_id" TO "userId";`
      );
    }
  }
}
