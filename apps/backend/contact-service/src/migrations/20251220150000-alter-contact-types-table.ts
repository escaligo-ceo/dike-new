import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterContactTypesTable20251220150000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make tenant_id and owner_id nullable to allow global types
    await queryRunner.query(
      `ALTER TABLE "contact_types" ALTER COLUMN "tenant_id" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_types" ALTER COLUMN "owner_id" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to NOT NULL constraints
    await queryRunner.query(
      `ALTER TABLE "contact_types" ALTER COLUMN "tenant_id" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_types" ALTER COLUMN "owner_id" SET NOT NULL`
    );
  }
}
