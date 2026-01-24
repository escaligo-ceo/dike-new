import { membershipTableName } from "@dike/common";
import { MigrationInterface, QueryRunner, TableUnique } from "typeorm";

export class AddUniqueMembershipTenantUser20251203143500
  implements MigrationInterface
{
  name = "AddUniqueMembershipTenantUser20251203143500";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Use TableUnique to create a named unique constraint on (tenant_id, user_id)
    const constraint = new TableUnique({
      name: "UQ_membership_tenant_user",
      columnNames: ["tenant_id", "user_id"],
    });

    // Ensure table exists before applying constraint
    const table = await queryRunner.getTable(membershipTableName);
    if (table) {
      const hasConstraint = table.uniques.some(
        (u) => u.name === constraint.name
      );
      if (!hasConstraint) {
        await queryRunner.createUniqueConstraint(
          membershipTableName,
          constraint
        );
      }
    } else {
      await queryRunner.createUniqueConstraint(membershipTableName, constraint);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(membershipTableName);
    if (table) {
      const constraint = table.uniques.find(
        (u) => u.name === "UQ_membership_tenant_user"
      );
      if (constraint) {
        await queryRunner.dropUniqueConstraint(membershipTableName, constraint);
      }
    } else {
      await queryRunner.dropUniqueConstraint(
        membershipTableName,
        "UQ_membership_tenant_user"
      );
    }
  }
}
