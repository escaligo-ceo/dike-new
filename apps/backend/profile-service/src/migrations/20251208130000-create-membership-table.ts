import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableUnique,
} from "typeorm";

export class CreateMembershipTable20251208130000 implements MigrationInterface {
  name = "CreateMembershipTable20251208130000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "membership",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "gen_random_uuid()",
          },
          { name: "tenant_id", type: "uuid", isNullable: false },
          { name: "user_id", type: "uuid", isNullable: false },
          {
            name: "role",
            type: "varchar",
            isNullable: false,
            default: "'member'",
          },
          {
            name: "created_at",
            type: "timestamptz",
            isNullable: false,
            default: "NOW()",
          },
          {
            name: "updated_at",
            type: "timestamptz",
            isNullable: false,
            default: "NOW()",
          },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      "membership",
      new TableIndex({ name: "idx_membership_user", columnNames: ["user_id"] })
    );

    // Ensure unique membership per (tenant_id, user_id)
    await queryRunner.createUniqueConstraint(
      "membership",
      new TableUnique({
        name: "UQ_membership_tenant_user",
        columnNames: ["tenant_id", "user_id"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("membership");
    const uq = table?.uniques.find(
      (u) => u.name === "UQ_membership_tenant_user"
    );
    if (uq) await queryRunner.dropUniqueConstraint("membership", uq);
    const idx = table?.indices.find((i) => i.name === "idx_membership_user");
    if (idx) await queryRunner.dropIndex("membership", idx);
    await queryRunner.dropTable("membership", true);
  }
}
