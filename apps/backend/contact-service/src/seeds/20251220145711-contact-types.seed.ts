import type { SeedInterface } from "@dike/common";
import { ContactType } from "@dike/common";
import { QueryRunner } from "typeorm";

const contactTypes: Partial<ContactType>[] = [
  { name: "Cliente" },
  { name: "Controparte" },
  { name: "Avvocato" },
  { name: "Collega di studio" },
  { name: "Giudice / Magistrato" },
  { name: "Consulente / Perito / CTU" },
  { name: "Consulente / Perito / CTU" },
  { name: "Testimone" },
  { name: "Ente / Azienda" },
  { name: "Studio legale esterno" },
  { name: "Tribunale / Ufficio giudiziario" },
  { name: "Compagnia assicurativa" },
  { name: "Fornitore" },
  { name: "Commercialista / Consulente fiscale" },
  { name: "Banca / Istituto di credito" },
  { name: "Altro" },
];

export class ContactTypes20251220145711 implements SeedInterface {
  async run(queryRunner: QueryRunner): Promise<void> {
    const contactTypeRepo = queryRunner.manager.getRepository(ContactType);
    for (const item of contactTypes) {
      const instance = contactTypeRepo.create(item);
      await contactTypeRepo.save(instance);
    }
  }
}
