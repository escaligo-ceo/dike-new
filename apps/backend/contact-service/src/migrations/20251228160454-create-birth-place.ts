import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateBirthPlace20251228160454 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "birth_places",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "country",
            type: "varchar",
            length: "2",
            isNullable: false,
          },
          {
            name: "cadastralCode",
            type: "varchar",
            length: "4",
            isNullable: false,
          },
          {
            name: "city",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "state",
            type: "varchar",
            length: "2",
            isNullable: false,
          },
        ],
        indices: [
          {
            name: "IDX_BIRTH_PLACE_COUNTRY",
            columnNames: ["country"],
          },
          {
            name: "IDX_BIRTH_PLACE_MUNICIPALITY",
            columnNames: ["city"],
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("birth_places", true);
  }
}
