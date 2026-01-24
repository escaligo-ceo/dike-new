import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RenameOfficeTableAndAddColumns20260104115600 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rinomina la tabella da "office" a "offices"
    await queryRunner.renameTable("office", "offices");

    // Aggiungi la colonna description
    const table = await queryRunner.getTable("offices");
    if (table && !table.findColumnByName("description")) {
      await queryRunner.addColumn(
        "offices",
        new TableColumn({
          name: "description",
          type: "text",
          isNullable: true,
          default: null,
        })
      );
    }

    // Aggiungi la colonna address_id (rinominando address se esiste)
    if (table?.findColumnByName("address")) {
      await queryRunner.renameColumn("offices", "address", "address_id");
    } else if (!table?.findColumnByName("address_id")) {
      await queryRunner.addColumn(
        "offices",
        new TableColumn({
          name: "address_id",
          type: "uuid",
          isNullable: true,
          default: null,
        })
      );
    }

    // Aggiungi la colonna deleted_at
    const updatedTable = await queryRunner.getTable("offices");
    if (updatedTable && !updatedTable.findColumnByName("deleted_at")) {
      await queryRunner.addColumn(
        "offices",
        new TableColumn({
          name: "deleted_at",
          type: "timestamptz",
          isNullable: true,
          default: null,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("offices");

    // Rimuovi colonne aggiunte
    if (table?.findColumnByName("deleted_at")) {
      await queryRunner.dropColumn("offices", "deleted_at");
    }

    if (table?.findColumnByName("address_id")) {
      await queryRunner.renameColumn("offices", "address_id", "address");
    }

    if (table?.findColumnByName("description")) {
      await queryRunner.dropColumn("offices", "description");
    }

    // Rinomina la tabella indietro
    await queryRunner.renameTable("offices", "office");
  }
}
