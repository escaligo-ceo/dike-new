import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddSinceToToPlanTable20260103142017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "plans",
      new TableColumn({
        name: "since",
        type: "timestamptz",
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      "plans",
      new TableColumn({
        name: "to",
        type: "timestamptz",
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("plans", "since");
    await queryRunner.dropColumn("plans", "to");
  }
}
