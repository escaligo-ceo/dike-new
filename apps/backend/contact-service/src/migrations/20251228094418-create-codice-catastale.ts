import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCodiceCatastale20251228094418 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "codice_catastale",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "region",
            type: "varchar",
            length: "100",
            isNullable: true,
          },
          {
            name: "code",
            type: "varchar",
            length: "10",
            isNullable: false,
          },
          {
            name: "type",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "since",
            type: "timestamp",
            isNullable: true,
          },
          {
            name: "to",
            type: "timestamp",
            isNullable: true,
          },
        ],
        indices: [
          {
            name: "IDX_CODICE_CATASTALE_CODICE",
            columnNames: ["code"],
          },
          {
            name: "IDX_CODICE_CATASTALE_TIPO",
            columnNames: ["type"],
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("codice_catastale", true);
  }
}
