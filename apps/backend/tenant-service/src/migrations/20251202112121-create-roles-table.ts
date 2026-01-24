import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateRolesTable20251202112121 implements MigrationInterface {
  name = "CreateRolesTable20251202112121";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: "roles",
      columns: [
        {
          name: "id",
          type: "uuid",
          isPrimary: true,
          default: "gen_random_uuid()",
        },
        { name: "team_id", type: "uuid", isNullable: true },
        { name: "name", type: "varchar", length: "255", isNullable: false },
        {
          name: "permissions",
          type: "jsonb",
          isNullable: false,
          default: "'[]'",
        },
      ],
    });

    const hasTable = await queryRunner.hasTable("roles");
    if (!hasTable) {
      await queryRunner.createTable(table, true);
    }

    const index = new TableIndex({
      name: "idx_roles_team",
      columnNames: ["team_id"],
    });
    const currentTable = await queryRunner.getTable("roles");
    const hasIndex = currentTable?.indices.some((i) => i.name === index.name);
    if (!hasIndex) {
      await queryRunner.createIndex("roles", index);
    }

    const fk = new TableForeignKey({
      name: "FK_roles_team",
      columnNames: ["team_id"],
      referencedTableName: "teams",
      referencedColumnNames: ["id"],
      onDelete: "CASCADE",
    });
    const hasFk = currentTable?.foreignKeys.some((f) => f.name === fk.name);
    if (!hasFk) {
      await queryRunner.createForeignKey("roles", fk);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("roles");
    if (table) {
      const fk = table.foreignKeys.find((f) => f.name === "FK_roles_team");
      if (fk) {
        await queryRunner.dropForeignKey("roles", fk);
      }
      const idx = table.indices.find((i) => i.name === "idx_roles_team");
      if (idx) {
        await queryRunner.dropIndex("roles", idx);
      }
    }
    const hasTable = await queryRunner.hasTable("roles");
    if (hasTable) {
      await queryRunner.dropTable("roles");
    }
  }
}
