import { mappingsTableName } from "@dike/common";
import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterMappingsRenameRulesToRules20251223140000 implements MigrationInterface {
  name = "AlterMappingsRenameRulesToRules20251223140000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(mappingsTableName);
    if (!table) return;

    // Rename rules to rules
    const hasMappingRules = !!table.columns.find((c) => c.name === "rules");
    const hasRules = !!table.columns.find((c) => c.name === "rules");

    if (hasMappingRules && !hasRules) {
      await queryRunner.renameColumn(mappingsTableName, "mappingRules", "rules");
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable(mappingsTableName);
    if (!table) return;

    // Rename rules back to rules
    const hasRules = !!table.columns.find((c) => c.name === "rules");
    const hasMappingRules = !!table.columns.find((c) => c.name === "rules");

    if (hasRules && !hasMappingRules) {
      await queryRunner.renameColumn(mappingsTableName, "rules", "mappingRules");
    }
  }
}
