import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RemoveObsoleteContactFields20251225000105 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("contacts", "email");
    await queryRunner.dropColumn("contacts", "phone");
    await queryRunner.dropColumn("contacts", "address");
    await queryRunner.dropColumn("contacts", "city");
    await queryRunner.dropColumn("contacts", "country");
    await queryRunner.dropColumn("contacts", "postal_code");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore email column
    await queryRunner.addColumn(
      "contacts",
      new TableColumn({
        name: "email",
        type: "varchar",
        length: "100",
        isNullable: true,
      })
    );

    // Restore phone column
    await queryRunner.addColumn(
      "contacts",
      new TableColumn({
        name: "phone",
        type: "varchar",
        length: "15",
        isNullable: true,
      })
    );

    // Restore address column
    await queryRunner.addColumn(
      "contacts",
      new TableColumn({
        name: "address",
        type: "varchar",
        length: "200",
        isNullable: true,
      })
    );
  }
}
