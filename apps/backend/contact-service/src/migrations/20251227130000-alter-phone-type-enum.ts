import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterPhoneTypeEnum20251227130000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL doesn't allow direct enum alteration, so we need to:
    // 1. Create a new enum type with all values
    // 2. Drop the default constraint from the column
    // 3. Alter the column to use the new type
    // 4. Drop the old enum type
    // 5. Restore the default constraint with the new enum type

    await queryRunner.query(
      `CREATE TYPE phone_type_enum_new AS ENUM (
        'HOME',
        'BUSINESS',
        'MOBILE',
        'ORGANIZATION_MAIN',
        'PAGER',
        'OTHER',
        'TTY',
        'TELEX',
        'HOME_FAX',
        'BUSINESS_FAX',
        'OTHER_FAX',
        'ASSISTANT_PHONE',
        'CALLBACK_PHONE',
        'RADIO_PHONE',
        'TELTEX'
      )`
    );

    // Drop the default constraint
    await queryRunner.query(
      `ALTER TABLE phones ALTER COLUMN type DROP DEFAULT`
    );

    // Update the column to use the new enum type
    await queryRunner.query(
      `ALTER TABLE phones ALTER COLUMN type TYPE phone_type_enum_new USING type::text::phone_type_enum_new`
    );

    // Drop the old enum type
    await queryRunner.query(`DROP TYPE phone_type_enum`);

    // Rename the new enum type to the original name
    await queryRunner.query(
      `ALTER TYPE phone_type_enum_new RENAME TO phone_type_enum`
    );

    // Restore the default constraint with the new enum type
    await queryRunner.query(
      `ALTER TABLE phones ALTER COLUMN type SET DEFAULT 'MOBILE'::phone_type_enum`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback by recreating the old enum with only the original values
    await queryRunner.query(
      `CREATE TYPE phone_type_enum_old AS ENUM ('HOME','WORK','BUSINESS')`
    );

    // Drop the default constraint
    await queryRunner.query(
      `ALTER TABLE phones ALTER COLUMN type DROP DEFAULT`
    );

    // Update the column to use the old enum type
    await queryRunner.query(
      `ALTER TABLE phones ALTER COLUMN type TYPE phone_type_enum_old USING type::text::phone_type_enum_old`
    );

    // Drop the new enum type
    await queryRunner.query(`DROP TYPE phone_type_enum`);

    // Rename the old enum type back to the original name
    await queryRunner.query(
      `ALTER TYPE phone_type_enum_old RENAME TO phone_type_enum`
    );

    // Restore the default constraint with the old enum type
    await queryRunner.query(
      `ALTER TABLE phones ALTER COLUMN type SET DEFAULT 'MOBILE'::phone_type_enum`
    );
  }
}
