import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddBirthPlaceAndGenderToContact20251229125915 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the anagraphic_sex enum type
    await queryRunner.query(
      `CREATE TYPE anagraphic_sex_enum AS ENUM ('M', 'F')`
    );

    // Add birth_place column (JSONB)
    await queryRunner.addColumn(
      "contacts",
      new TableColumn({
        name: "birth_place",
        type: "jsonb",
        isNullable: true,
      })
    );

    // Add gender column (enum)
    await queryRunner.addColumn(
      "contacts",
      new TableColumn({
        name: "anagraphic_sex",
        type: "anagraphic_sex_enum",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the columns
    await queryRunner.dropColumn("contacts", "birth_place");
    await queryRunner.dropColumn("contacts", "anagraphic_sex");

    // Drop the enum type
    await queryRunner.query(`DROP TYPE anagraphic_sex_enum`);
  }
}
