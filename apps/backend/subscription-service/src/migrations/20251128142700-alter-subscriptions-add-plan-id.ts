import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class AlterSubscriptionsAddPlanId20251128142700
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("subscriptions");
    const tableName = table?.name;
    if (!tableName) {
      throw new Error("Table 'subscriptions' not found");
    }

    // Rimuovi la colonna plan_type
    if (table?.findColumnByName("plan_type")) {
      await queryRunner.dropColumn(tableName, "plan_type");
    }

    // Aggiungi la colonna plan_id
    await queryRunner.addColumn(
      tableName,
      new TableColumn({
        name: "plan_id",
        type: "uuid",
        isNullable: false,
      })
    );

    // Aggiungi la foreign key verso la tabella plans
    await queryRunner.createForeignKey(
      tableName,
      new TableForeignKey({
        columnNames: ["plan_id"],
        referencedTableName: "plans",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
        name: "fk_subscriptions_plan",
      })
    );

    // Cambia il tipo di start_date a timestamptz
    await queryRunner.changeColumn(
      tableName,
      "start_date",
      new TableColumn({
        name: "start_date",
        type: "timestamptz",
        isNullable: false,
      })
    );

    // Cambia il tipo di end_date a timestamptz
    await queryRunner.changeColumn(
      tableName,
      "end_date",
      new TableColumn({
        name: "end_date",
        type: "timestamptz",
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("subscriptions");
    const tableName = table?.name;

    await queryRunner.dropForeignKey(tableName!, "fk_subscriptions_plan");
    await queryRunner.dropColumn(tableName!, "plan_id");
    await queryRunner.addColumn(
      tableName!,
      new TableColumn({
        name: "plan_type",
        type: "varchar",
        length: "32",
        isNullable: false,
        default: "'free'",
      })
    );
    await queryRunner.changeColumn(
      tableName!,
      "start_date",
      new TableColumn({
        name: "start_date",
        type: "timestamp",
        isNullable: false,
      })
    );
    await queryRunner.changeColumn(
      tableName!,
      "end_date",
      new TableColumn({
        name: "end_date",
        type: "timestamp",
        isNullable: false,
      })
    );
  }
}
