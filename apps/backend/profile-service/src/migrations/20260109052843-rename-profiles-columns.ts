import { profileTableName } from "@dike/common";
import { MigrationInterface, QueryRunner, Table } from "typeorm";

/**
 * Migrazione per allineare i nomi delle colonne della tabella `profiles`
 * allo schema attuale dell'entità (snake_case).
 *
 * Esegue i renaming in modo idempotente: rinomina solo se la colonna di origine esiste
 * e quella di destinazione non esiste ancora.
 */
export class RenameProfilesDefaultTenantIdAndDefaultRedirectUrlColumns20260109052843 implements MigrationInterface {
  name =
    "RenameProfilesDefaultTenantIdAndDefaultRedirectUrlColumns20260109052843";

  private async renameIfExists(
    queryRunner: QueryRunner,
    tableName: string,
    from: string,
    to: string
  ) {
    const table: Table | undefined = await queryRunner.getTable(tableName);
    if (!table) return false;

    const fromCol = table.findColumnByName(from);
    const toCol = table.findColumnByName(to);

    if (fromCol && !toCol) {
      await queryRunner.renameColumn(table, fromCol, to);
      return true;
    }
    return false;
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    const pairs: Array<[string, string]> = [
      ["default_tenant_id", "tenant_id"],
      ["default_redirect_url", "redirect_url"],
    ];

    for (const [from, to] of pairs) {
      await this.renameIfExists(queryRunner, profileTableName, from, to);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const pairs: Array<[string, string]> = [
      ["tenant_id", "default_tenant_id"],
      ["redirect_url", "default_redirect_url"],
    ];

    for (const [from, to] of pairs) {
      await this.renameIfExists(queryRunner, profileTableName, from, to);
    }
  }
}
