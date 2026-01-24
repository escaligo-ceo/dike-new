import { profileTableName } from "@dike/common";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUserProfilesTableWithJobRole20250821120000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop legacy enum type if exists (cleanup from old migrations)
    await queryRunner.query('DROP TYPE IF EXISTS "job_role_enum" CASCADE;');
    // Drop tables if they already exist (idempotent for dev/reset)
    await queryRunner.query('DROP TABLE IF EXISTS "profiles" CASCADE;');
    await queryRunner.query('DROP TABLE IF EXISTS "job_roles" CASCADE;');

    // Create job_roles lookup table
    await queryRunner.query(`
      CREATE TABLE "job_roles" (
        "id" int PRIMARY KEY,
        "label" varchar(64) NOT NULL
      );
    `);
    // // Insert standard roles (0=Avvocato, 1=Praticante, 2=Assistente, 3=Amministratore di Sistema, 4=Custom)
    // await queryRunner.query(`
    //   INSERT INTO "job_roles" ("id", "label") VALUES
    //     (0, 'Avvocato'),
    //     (1, 'Praticante'),
    //     (2, 'Assistente'),
    //     (3, 'Amministratore di Sistema'),
    //     (4, 'Custom');
    // `);

    // Create profiles table
    await queryRunner.createTable(
      new Table({
        name: profileTableName,
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isNullable: false,
            default: "gen_random_uuid()",
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: false,
            isUnique: true,
          },
          {
            name: "first_name",
            type: "varchar",
            isNullable: true,
            default: null,
          },
          {
            name: "last_name",
            type: "varchar",
            isNullable: true,
            default: null,
          },
          {
            name: "full_name",
            type: "varchar",
            isNullable: true,
            default: null,
          },
          {
            name: "email",
            type: "varchar",
            isNullable: true,
            default: null,
          },
          {
            name: "phone_number",
            type: "varchar",
            isNullable: true,
            default: null,
          },
          {
            name: "piva",
            type: "varchar",
            isNullable: true,
            default: null,
          },
          {
            name: "date_of_birth",
            type: "date",
            isNullable: true,
            default: null,
          },
          {
            name: "avatar_url",
            type: "varchar",
            isNullable: true,
            default: null,
          },
          {
            name: "background_url",
            type: "varchar",
            isNullable: true,
            default: null,
          },
          {
            name: "bio",
            type: "varchar",
            isNullable: true,
            default: null,
          },
          {
            name: "default_redirect_url",
            type: "varchar",
            isNullable: true,
            default: "'/onboarding/user'",
          },
          {
            name: "job_role",
            type: "int",
            isNullable: true,
            default: null,
            comment:
              "Codice numerico del ruolo professionale (0=Avvocato, 1=Praticante, 2=Assistente, 3=Amministratore di Sistema, 4=Custom)",
          },
          {
            name: "job_role_text",
            type: "varchar",
            isNullable: true,
            comment:
              "Etichetta/descrizione del ruolo professionale. Obbligatoria se job_role=4 (Custom)",
          },
        ],
      })
    );
    // Add FK constraint
    await queryRunner.query(
      'ALTER TABLE "profiles" ADD CONSTRAINT "FK_profiles_job_roles" FOREIGN KEY ("job_role") REFERENCES "job_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("profiles");
    await queryRunner.query('DROP TABLE IF EXISTS "job_roles" CASCADE;');
  }
}
