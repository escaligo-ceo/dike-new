import {
  Feature,
  Plan,
  PlanFeature,
  PlanKeys,
  SeedInterface,
} from "@dike/common";
import { randomUUID } from "crypto";
import { QueryRunner } from "typeorm";

const featureKeysForFreePlan = [
  "gestione-pratiche",
  "calendario-udienze-scadenze",
  "gestione-contabile",
  "rubrica-conatti",
  "gestione-documenti",
  "statistiche-base",
  "dashboard-riepilogativa",
  "fatturazione-elettronica",
  "generazione-fatture-pdf",
  "integrazione-fatturazione-elettronica-sdi",
];

const featureKeysForBasePlan = [
  "max-user-count-for-tentant",
  "invio-fattura-elettronica-a-sdi",
  "personalizzazione-layout-fatture",
  "gestione-multi-sede",
  "multi-utente",
  "spazio-archiviazione",
  "backup-automatico-giornaliero",
  "accesso-api-integrazioni-esterne",
  "documentazione-sviluppatori",
  "integrazione-software-esterni-api",
];

const featureKeysForProfessionalPlan = [
  "multi-sede",
  "supporto-tecnico",
  "hosting-centralizzato",
  "reportistica",
  "on-premise-installation",
  "multi-tenant-managment",
  "custom-app-module-store",
  "automazioni-workflow-intelligenti",
  "custom-email-templates",
  "accesso-mobile-friendly",
];

const featureKeysForEnterprisePlan = [
  "moduli-aggiuntivi",
  "generazione-automatica-attivita",
  "notifiche-email-pec",
  "gestione-email-pec",
  "ricerca-avanzata-clienti-pratiche",
  "sicurezza-avanzata",
];

export class PlanFeaturesSeeds20251105204900 implements SeedInterface {
  async run(queryRunner: QueryRunner): Promise<void> {
    const plansRepo = queryRunner.manager.getRepository(Plan);
    const featuresRepo = queryRunner.manager.getRepository(Feature);
    const repo = queryRunner.manager.getRepository(PlanFeature);

    let plan: Plan | null = null;

    plan = await plansRepo.findOne({ where: { key: PlanKeys.FREE } });

    if (!plan || plan === null) {
      console.warn(
        `Plan with key ${PlanKeys.FREE} not found, skipping features`
      );
      return;
    }

    for (const featureKey of featureKeysForFreePlan) {
      const feature = await featuresRepo.findOne({
        where: { key: featureKey },
      });
      if (!feature || feature === null) {
        console.warn(`Feature with key ${featureKey} not found, skipping`);
        continue;
      }

      // avoid duplicates
      const existing = await repo.findOne({
        where: { planId: plan.id, featureId: feature.id },
      });
      if (existing) continue;

      const planFeature: PlanFeature = repo.create({
        id: randomUUID(),
        planId: plan.id,
        featureId: feature.id,
        limit: null,
      });
      await repo.save(planFeature);
    }

    plan = await plansRepo.findOne({ where: { key: PlanKeys.BASE } });
    if (!plan || plan === null) {
      console.warn(
        `Plan with key ${PlanKeys.BASE} not found, skipping features`
      );
    } else {
      for (const featureKey of [
        ...featureKeysForFreePlan,
        ...featureKeysForBasePlan,
      ]) {
        const feature = await featuresRepo.findOne({
          where: { key: featureKey },
        });
        if (!feature || feature === null) {
          console.warn(`Feature with key ${featureKey} not found, skipping`);
          continue;
        }

        const existing = await repo.findOne({
          where: { planId: plan.id, featureId: feature.id },
        });
        if (existing) continue;

        const planFeature = repo.create({
          planId: plan.id,
          featureId: feature.id,
          limit: null,
        });
        await repo.save(planFeature);
      }
    }

    plan = await plansRepo.findOne({ where: { key: PlanKeys.PROFESSIONAL } });
    if (!plan || plan === null) {
      console.warn(
        `Plan with key ${PlanKeys.PROFESSIONAL} not found, skipping features`
      );
    } else {
      for (const featureKey of [
        ...featureKeysForFreePlan,
        ...featureKeysForBasePlan,
        ...featureKeysForProfessionalPlan,
      ]) {
        const feature = await featuresRepo.findOne({
          where: { key: featureKey },
        });
        if (!feature || feature === null) {
          console.warn(`Feature with key ${featureKey} not found, skipping`);
          continue;
        }

        const existing = await repo.findOne({
          where: { planId: plan.id, featureId: feature.id },
        });
        if (existing) continue;

        const planFeature = repo.create({
          planId: plan.id,
          featureId: feature.id,
          limit: null,
        });
        await repo.save(planFeature);
      }
    }

    plan = await plansRepo.findOne({ where: { key: PlanKeys.ENTERPRISE } });
    if (!plan || plan === null) {
      console.warn(
        `Plan with key ${PlanKeys.ENTERPRISE} not found, skipping features`
      );
    } else {
      for (const featureKey of [
        ...featureKeysForFreePlan,
        ...featureKeysForBasePlan,
        ...featureKeysForProfessionalPlan,
        ...featureKeysForEnterprisePlan,
      ]) {
        const feature = await featuresRepo.findOne({
          where: { key: featureKey },
        });
        if (!feature || feature === null) {
          console.warn(`Feature with key ${featureKey} not found, skipping`);
          continue;
        }

        const existing = await repo.findOne({
          where: { planId: plan.id, featureId: feature.id },
        });
        if (existing) continue;

        const planFeature = repo.create({
          planId: plan.id,
          featureId: feature.id,
          limit: null,
        });
        await repo.save(planFeature);
      }
    }
  }
}
