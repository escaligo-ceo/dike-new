import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddDeletedAtToPlanTable20260103142157 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "plan_features",
      new TableColumn({
        name: "deleted_at",
        type: "timestamp",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("plan_features", "deleted_at");
  }
}
