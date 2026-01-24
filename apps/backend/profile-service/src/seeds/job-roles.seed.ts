import type { SeedInterface } from "@dike/common";
import { JobRole } from "@dike/common";
import { QueryRunner } from "typeorm";

const jobRoles = [
  { name: "Avvocato", isCustom: false, isDefault: true },
  { name: "Praticante", isCustom: false, isDefault: false },
  { name: "Collaboratore", isCustom: false, isDefault: false },
  { name: "Segretaria", isCustom: false, isDefault: false },
  { name: "Amministratore di sistema", isCustom: false, isDefault: false },
];

export class JobRolesSeeds20251105204700 implements SeedInterface {
  async run(queryRunner: QueryRunner): Promise<void> {
    const jobRoleRepo = queryRunner.manager.getRepository(JobRole);
    // Check if a default standard job role already exists
    const existingDefault = await jobRoleRepo.findOne({
      where: { isDefault: true },
    });
    for (const item of jobRoles) {
      // Avoid duplicates by name
      const already = await jobRoleRepo.findOne({ where: { name: item.name } });
      if (already) continue;
      const payload = { ...item } as Partial<JobRole>;
      if (payload.isDefault && existingDefault) {
        // Keep only one default; switch others to non-default
        payload.isDefault = false;
      }
      const instance = jobRoleRepo.create(payload);
      await jobRoleRepo.save(instance);
    }
  }
}
