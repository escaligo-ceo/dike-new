import { Plan, PlanKeys, SeedInterface } from "@dike/common";
import { QueryRunner } from "typeorm";

const plans = [
  {
    key: PlanKeys.FREE,
    startDate: new Date(),
    priceMonthly: 0,
    priceYearly: 0,
    name: "Gratuito",
    description: "Per iniziare a conoscere la piattaforma",
  },
  // {
  //   key: PlanKeys.BASE,
  //   startDate: new Date(),
  //   priceMonthly: 14,
  //   priceYearly: 140,
  //   name: "Base",
  //   description: "Se hai bisogno di organizzare il tuo lavoro quotidiano",
  // },
  {
    key: PlanKeys.PROFESSIONAL,
    startDate: new Date(),
    priceMonthly: 29,
    priceYearly: 290,
    name: "Professionale",
    description:
      "Se hai bisogno di una gestione sicura dei ruoli e vuoi connettere diverse persone",
  },
  {
    key: PlanKeys.ENTERPRISE,
    startDate: new Date(),
    priceMonthly: 49,
    priceYearly: 490,
    name: "Aziendale",
    description: "Per studi legali e professionisti del settore",
  },
];

export class PlansSeeds20251105204700 implements SeedInterface {
  async run(queryRunner: QueryRunner): Promise<void> {
    const plansRepo = queryRunner.manager.getRepository(Plan);
    for (const item of plans) {
      const exists = await plansRepo.findOne({ where: { key: item.key } });
      if (exists) continue;
      const plan = plansRepo.create({ ...item });
      await plansRepo.save(plan);
    }
  }
}
