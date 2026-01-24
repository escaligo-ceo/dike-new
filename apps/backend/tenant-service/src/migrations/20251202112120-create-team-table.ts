import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateTeamTable20251202112120 implements MigrationInterface {
  name = "CreateTeamTable20251202112120";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "teams",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          {
            name: "name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "tenantId",
            type: "uuid",
            isNullable: true,
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "teams",
      new TableIndex({ name: "idx_teams_tenant", columnNames: ["tenantId"] })
    );

    await queryRunner.createForeignKey(
      "teams",
      new TableForeignKey({
        name: "FK_teams_tenant",
        columnNames: ["tenantId"],
        referencedTableName: "tenant",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("teams");
    const fk = table?.foreignKeys.find((f) => f.name === "FK_teams_tenant");
    if (fk) await queryRunner.dropForeignKey("teams", fk);
    const idx = table?.indices.find((i) => i.name === "idx_teams_tenant");
    if (idx) await queryRunner.dropIndex("teams", idx);
    await queryRunner.dropTable("teams", true);
  }
}
