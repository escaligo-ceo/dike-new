import { Feature, SeedInterface } from "@dike/common";
import { DataSource, QueryRunner } from "typeorm";

const featues = [
  {
    key: "gestione-pratiche",
    name: "Gestione pratiche",
    description: "Numero massimo di pratiche gestibili",
  },
  {
    key: "calendario-udienze-scadenze",
    name: "Calendario udienze scadenze",
    description: "Calendario udienze e scadenze condiviso",
  },
  {
    key: "gestione-contabile",
    name: "Gestione contabile",
    description: "Gestione contabile (spese, parcelle)",
  },
  {
    key: "rubrica-conatti",
    name: "Rubrica contatti",
    description: "Rubrica contatti",
  },
  {
    key: "gestione-documenti",
    name: "Gestione documenti",
    description: "Gestione Documenti",
  },
  {
    key: "statistiche-base",
    name: "Statistiche base",
    description: "Statistiche base",
  },
  {
    key: "dashboard-riepilogativa",
    name: "Dashboard riepilogativa",
    description: "Dashboard riepilogativa semplice",
  },
  {
    key: "fatturazione-elettronica",
    name: "Fatturazione elettronica",
    description:
      "Invio automatico fatture elettroniche al Sistema di Interscambio",
  },
  {
    key: "generazione-fatture-pdf",
    name: "Generazione fatture PDF",
    description: "Generazione fatture PDF",
  },
  {
    key: "integrazione-fatturazione-elettronica-sdi",
    name: "Integrazione fatturazione elettronica (SDI)",
    description: "Integrazione fatturazione elettronica (SDI)",
  },
  {
    key: "max-user-count-for-tentant",
    name: "Numero massimo di utenti per tenant",
    description: "Numero massimo di utenti per tenant",
  },
  {
    key: "invio-fattura-elettronica-a-sdi",
    name: "Invio Fattura elettronica a SDI)",
    description: "Invio fattura elettronica a SDI",
  },
  {
    key: "personalizzazione-layout-fatture",
    name: "Personalizzazione layout fatture",
    description:
      "Personalizzazione layout fatture (logo, colori, intestazione)",
  },
  {
    key: "gestione-multi-sede",
    name: "Gestione multi-sede",
    description: "Gestione miulti-sede",
  },
  {
    key: "multi-utente",
    name: "Multi utente",
    description: "Mlti-utente (avvocati, segretarie, collaboratori)",
  },
  {
    key: "spazio-archiviazione",
    name: "Spazio archiviazione",
    description: "Spazio archiviazione",
  },
  {
    key: "backup-automatico-giornaliero",
    name: "Backup automatico giornaliero",
    description: "Backup automatico giornaliero",
  },
  {
    key: "accesso-api-integrazioni-esterne",
    name: "Accesso API integrazioni esterne",
    description: "Accesso API integrazioni esterne",
  },
  {
    key: "documentazione-sviluppatori",
    name: "Documentazione sviluppatori",
    description: "Documentazione sviluppatori",
  },
  {
    key: "integrazione-software-esterni-api",
    name: "Integrazione software esterni (API)",
    description: "Integrazione con software esterni (API)",
  },
  {
    key: "multi-sede",
    name: "Multi-sede",
    description: "Gestione multi-sede",
  },
  {
    key: "supporto-tecnico",
    name: "Supporto tecnico",
    description: "Supporto tecnico",
  },
  {
    key: "hosting-centralizzato",
    name: "Hosting centralizzato su dike.cloud",
    description: "Hosting centralizzato su dike.cloud",
  },
  {
    key: "reportistica",
    name: "Reportistica",
    description: "Reportistica",
  },
  {
    key: "on-premise-installation",
    name: "Possibilità di installare su server privato",
    description: "Possibilità di installazione su server privato",
  },
  {
    key: "multi-tenant-managment",
    name: "Gestione Multi-tenant",
    description: "Gestione Multi-tenant (per studi multipli)",
  },
  {
    key: "custom-app-module-store",
    name: "App personalizzate/Store di moduli",
    description: "App personalizzate / store di moduli",
  },
  {
    key: "automazioni-workflow-intelligenti",
    name: "Automazioni workflow intelligenti",
    description: "Automazioni / workflow intelligenti",
  },
  {
    key: "custom-email-templates",
    name: "Custom email templates",
    description: "Permette ai tenant di usare template email personalizzati",
  },
  {
    key: "accesso-mobile-friendly",
    name: "Accesso mobile friendly",
    description: "Accesso mobile friendly",
  },
  {
    key: "moduli-aggiuntivi",
    name: "Moduli aggiuntivi",
    description: "Moduli aggiuntivi (store interno)",
  },
  {
    key: "generazione-automatica-attivita",
    name: "Generazione automatica attività",
    description:
      "Consente di programmare la generazione automatica delle attività a fronte di eventi o scadenza",
  },

  {
    key: "notifiche-email-pec",
    name: "Notifiche email PEC",
    description: "Notifiche email base",
  },
  {
    key: "gestione-email-pec",
    name: "Notifiche email PEC",
    description: "Notifiche email base",
  },
  {
    key: "ricerca-avanzata-clienti-pratiche",
    name: "Ricerca avanzata clienti/pratiche",
    description: "Ricerca avanzata clienti/pratiche",
  },
  {
    key: "sicurezza-avanzata",
    name: "Sicurezza avanzata",
    description: "Sicurezza avanzata (audit log, versioning)",
  },
];

export class FeaturesSeeds20251105204800 implements SeedInterface {
  async run(queryRunner: QueryRunner): Promise<void> {
    const repo = queryRunner.manager.getRepository(Feature);
    let order = 0;
    for (const item of featues) {
      const exists = await repo.findOne({ where: { key: item.key } });
      if (exists) {
        order++;
        continue;
      }
      const feature = repo.create({ ...item, order });
      order++;
      await repo.save(feature);
    }
  }
}
