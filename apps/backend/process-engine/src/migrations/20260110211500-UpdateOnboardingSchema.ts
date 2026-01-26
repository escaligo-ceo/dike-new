import { onboardingsTableName } from "@dike/common";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class UpdateOnboardingSchema20260110211500 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table: Table | undefined =
      await queryRunner.getTable(onboardingsTableName);
    if (!table) {
      // If table does not exist, create minimal schema aligned with entity
      await queryRunner.query(`
        CREATE TABLE "${onboardingsTableName}" (
          "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          "userId" varchar(64) NOT NULL,
          "status" varchar(50) NOT NULL DEFAULT 'pending',
          "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "deleted_at" timestamptz NULL
        );
      `);
      await queryRunner.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_onboarding_userId" ON "${onboardingsTableName}" ("userId");`
      );
      return;
    }

    // Ensure id column is uuid and part of PK
    const idCol = table.findColumnByName("id");
    if (!idCol) {
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" ADD COLUMN "id" uuid DEFAULT uuid_generate_v4();`
      );
    }

    // If id is not uuid, replace it with uuid while preserving PK
    if (idCol && idCol.type !== "uuid") {
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" DROP CONSTRAINT IF EXISTS "${onboardingsTableName}_pkey";`
      );
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" ADD COLUMN "id_tmp" uuid DEFAULT uuid_generate_v4();`
      );
      await queryRunner.query(
        `UPDATE "${onboardingsTableName}" SET "id_tmp" = uuid_generate_v4() WHERE "id_tmp" IS NULL;`
      );
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" DROP COLUMN "id";`
      );
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" RENAME COLUMN "id_tmp" TO "id";`
      );
    }

    // Ensure userId exists and is NOT NULL
    const userIdCol = table.findColumnByName("userId");
    if (!userIdCol) {
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" ADD COLUMN "userId" varchar(64) NOT NULL;`
      );
    } else if (userIdCol.isNullable) {
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" ALTER COLUMN "userId" SET NOT NULL;`
      );
    }

    // Drop previous PK and set composite PK on (id, userId) to match entity decorators
    await queryRunner.query(
      `ALTER TABLE "${onboardingsTableName}" DROP CONSTRAINT IF EXISTS "${onboardingsTableName}_pkey";`
    );
    await queryRunner.query(
      `ALTER TABLE "${onboardingsTableName}" ADD CONSTRAINT "${onboardingsTableName}_pkey" PRIMARY KEY ("id", "userId");`
    );

    // Align status column
    const statusCol = table.findColumnByName("status");
    if (!statusCol) {
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" ADD COLUMN "status" varchar(50) NOT NULL DEFAULT 'pending';`
      );
    } else {
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" ALTER COLUMN "status" TYPE varchar(50);`
      );
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" ALTER COLUMN "status" SET DEFAULT 'pending';`
      );
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" ALTER COLUMN "status" SET NOT NULL;`
      );
    }

    // Rename timestamps to snake_case and add deleted_at
    const createdAtCol = table.findColumnByName("createdAt");
    if (createdAtCol && !table.findColumnByName("created_at")) {
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" RENAME COLUMN "createdAt" TO "created_at";`
      );
    } else if (!createdAtCol && !table.findColumnByName("created_at")) {
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" ADD COLUMN "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP;`
      );
    }

    const updatedAtCol = table.findColumnByName("updatedAt");
    if (updatedAtCol && !table.findColumnByName("updated_at")) {
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" RENAME COLUMN "updatedAt" TO "updated_at";`
      );
    } else if (!updatedAtCol && !table.findColumnByName("updated_at")) {
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" ADD COLUMN "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP;`
      );
    }

    if (!table.findColumnByName("deleted_at")) {
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" ADD COLUMN "deleted_at" timestamptz NULL;`
      );
    }

    // Drop unique index on userId if exists (redundant with composite PK including userId)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_onboarding_userId";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasNew = await queryRunner.hasTable(onboardingsTableName);
    if (!hasNew) return;

    // Revert composite PK to single PK on an auto-increment id
    await queryRunner.query(
      `ALTER TABLE "${onboardingsTableName}" DROP CONSTRAINT IF EXISTS "${onboardingsTableName}_pkey";`
    );

    // Ensure integer id exists as primary key
    const table: Table | undefined =
      await queryRunner.getTable(onboardingsTableName);
    const idCol = table?.findColumnByName("id");
    if (idCol && idCol.type !== "int") {
      // Replace uuid id with integer id backed by sequence
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" DROP COLUMN "id";`
      );
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" ADD COLUMN "id" int;`
      );
    } else if (!idCol) {
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" ADD COLUMN "id" int;`
      );
    }

    // Create sequence and populate ids
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "${onboardingsTableName}_id_seq" OWNED BY "${onboardingsTableName}"."id";`
    );
    await queryRunner.query(
      `ALTER TABLE "${onboardingsTableName}" ALTER COLUMN "id" SET DEFAULT nextval('"${onboardingsTableName}_id_seq"');`
    );
    await queryRunner.query(
      `UPDATE "${onboardingsTableName}" SET "id" = nextval('"${onboardingsTableName}_id_seq"') WHERE "id" IS NULL;`
    );
    await queryRunner.query(
      `ALTER TABLE "${onboardingsTableName}" ADD CONSTRAINT "${onboardingsTableName}_pkey" PRIMARY KEY ("id");`
    );

    // Add back unique index on userId
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_onboarding_userId" ON "${onboardingsTableName}" ("userId");`
    );

    // Rename timestamps back to camelCase and drop deleted_at
    const table2: Table | undefined =
      await queryRunner.getTable(onboardingsTableName);
    if (table2?.findColumnByName("created_at")) {
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" RENAME COLUMN "created_at" TO "createdAt";`
      );
    }
    if (table2?.findColumnByName("updated_at")) {
      await queryRunner.query(
        `ALTER TABLE "${onboardingsTableName}" RENAME COLUMN "updated_at" TO "updatedAt";`
      );
    }
    await queryRunner.query(
      `ALTER TABLE "${onboardingsTableName}" DROP COLUMN IF EXISTS "deleted_at";`
    );
  }
}
