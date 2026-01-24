import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateMembersTable20251202112122 implements MigrationInterface {
  name = "CreateMembersTable20251202112122";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "members",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "tenant_id", type: "uuid", isNullable: false },
          { name: "team_id", type: "uuid", isNullable: true },
          { name: "role_id", type: "uuid", isNullable: true },
          { name: "user_id", type: "uuid", isNullable: false },
          {
            name: "joined_at",
            type: "timestamp",
            isNullable: false,
            default: "NOW()",
          },
          { name: "active", type: "boolean", isNullable: false, default: true },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "members",
      new TableIndex({ name: "idx_members_user", columnNames: ["user_id"] })
    );

    await queryRunner.createForeignKey(
      "members",
      new TableForeignKey({
        name: "FK_members_team",
        columnNames: ["team_id"],
        referencedTableName: "teams",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      })
    );
    await queryRunner.createForeignKey(
      "members",
      new TableForeignKey({
        name: "FK_members_role",
        columnNames: ["role_id"],
        referencedTableName: "roles",
        referencedColumnNames: ["id"],
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("members");
    const fkRole = table?.foreignKeys.find((f) => f.name === "FK_members_role");
    if (fkRole) await queryRunner.dropForeignKey("members", fkRole);
    const fkTeam = table?.foreignKeys.find((f) => f.name === "FK_members_team");
    if (fkTeam) await queryRunner.dropForeignKey("members", fkTeam);
    const idx = table?.indices.find((i) => i.name === "idx_members_user");
    if (idx) await queryRunner.dropIndex("members", idx);
    await queryRunner.dropTable("members", true);
  }
}
