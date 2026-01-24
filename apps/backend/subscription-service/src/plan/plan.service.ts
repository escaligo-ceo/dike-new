import {
  AppLogger,
  inspect,
  Plan,
  PlanKeyLabels,
  PlanKeys,
} from "@dike/common";
import { LoggedUser, PlanDto } from "@dike/communication";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";
import { FeatureService } from "../feature/feature.service";

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    private readonly logger: AppLogger,
    private readonly featureService: FeatureService
  ) {
    this.logger = new AppLogger(PlanService.name);
  }

  async getByKey(loggedUser: LoggedUser, key: PlanKeys): Promise<Plan | null> {
    return await this.planRepository.findOne({
      where: {
        key,
        to: IsNull(),
        since: Not(IsNull()),
      },
    });
  }

  async getActivePlans(loggedUser: LoggedUser): Promise<PlanDto[]> {
    const plans = await this.planRepository.find({
      // where: {
      //   to: IsNull(),
      //   since: Not(IsNull()),
      // },
      withDeleted: false,
    });

    const planDtos: PlanDto[] = [];

    for (const plan of plans) {
      const features = await this.featureService.findByPlanKey(plan.key);
      const featureDtos = features.map((f) => ({
        key: f.key,
        name: f.name,
        description: f.description,
      }));

      planDtos.push({
        key: plan.key,
        name: this.mapPlanName(loggedUser, plan.key as PlanKeys),
        monthlyPrice: plan.priceMonthly,
        yearlyPrice: plan.priceYearly,
        features: featureDtos.map((f) => f.name),
        id: plan.id,
      });
    }

    return planDtos;
  }

  private mapPlanName(loggedUser: LoggedUser, planKey: PlanKeys): string {
    return (
      PlanKeyLabels[planKey] ??
      (() => {
        throw new Error(`invalid plan key: ${planKey}`);
      })()
    );
  }

  /**
   * Restituisce un piano attivo in base alla chiave fornita.
   * 
   * @param {LoggedUser} loggedUser - Utente autenticato che effettua l'operazione
   * @param {PlanKeys} planKey - Chiave del piano da recuperare
   * @returns {Promise<Plan | null>}
   */
  async getActivePlanByKey(loggedUser: LoggedUser, planKey: PlanKeys): Promise<Plan | null> {
    this.logger.log(`Getting active plan by key: ${planKey}`);
    const plan = await this.planRepository.findOne({
      where: {
        key: planKey ?? PlanKeys.FREE,
        // to: IsNull(),
        // since: Not(IsNull()),
      },
    });

    // if (!plan || plan.to === null) {
    //   throw new NotFoundException(`Active plan with key ${planKey} not found`);
    // }

    return plan;
  }

  async getById(loggedUser: LoggedUser, planId: string): Promise<Plan | null> {
    return await this.planRepository.findOne({
      where: {
        id: planId,
      },
    });
  }
}
