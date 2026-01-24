import {
  AppLogger,
  Feature,
  inspect,
  OriginDto,
  Plan,
  PlanKeys,
  Subscription,
  SubscriptionResponse,
  Token,
} from "@dike/common";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PlanService } from "../plan/plan.service";
import { LoggedUser } from "@dike/communication";

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly logger: AppLogger,
    @InjectRepository(Feature)
    private readonly featureRepository: Repository<Feature>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly planService: PlanService
  ) {
    this.logger = new AppLogger(SubscriptionService.name);
  }

  async getSubscriptionsByTenant(
    loggedUser: LoggedUser,
    tenantId?: string
  ): Promise<Subscription[]> {
    this.logger.log(`Getting subscriptions for tenant: ${tenantId}`);
    return this.subscriptionRepository.find({ where: { tenantId: tenantId ?? loggedUser.tenantId} });
  }

  async getAll(loggedUser: LoggedUser): Promise<Subscription[]> {
    this.logger.log(`Getting all subscriptions`);
    return this.subscriptionRepository.find();
  }

  async getActiveByTenant(
    loggedUser: LoggedUser,
    tenantId?: string
  ): Promise<SubscriptionResponse> {
    this.logger.log(`Getting subscriptions for tenant: ${tenantId}`);
    const subscription = await this.subscriptionRepository.findOne({
      where: { tenantId: tenantId ?? loggedUser.tenantId },
    });
    if (!subscription) {
      throw new NotFoundException(
        `Subscription not found for tenant: ${tenantId}`
      );
    }
    const { since } = subscription;
    const plan: Plan | null = await this.planService.getById(
      loggedUser,
      subscription.planId
    );
    if (!plan) {
      throw new NotFoundException(
        `Plan not found for id: ${subscription.planId}`
      );
    }
    const { name, description, priceMonthly, priceYearly, key } = plan;

    const response: SubscriptionResponse = {
      since,
      name,
      description,
      priceMonthly,
      priceYearly,
      planKey: key as PlanKeys,
    };

    return response;
  }

  async getActiveSubscription(): Promise<Subscription | null> {
    this.logger.log(`Getting all active subscriptions`);
    return this.subscriptionRepository.findOne({
      where: { isActive: true },
    });
  }

  private async changePlan(
    loggedUser: LoggedUser,
    newPlanKey: PlanKeys
  ): Promise<Subscription> {
    const plan: Plan | null = await this.planService.getActivePlanByKey(
      loggedUser,
      newPlanKey
    );
    if (!plan || plan === null) {
      throw new NotFoundException(`Active plan with key ${newPlanKey} not found`);
    }
    const activeSubscription = await this.getActiveSubscription();
    if (!activeSubscription || activeSubscription === null) {
      throw new NotFoundException(`No active subscription found to upgrade`);
    }
    const canChangeTo = activeSubscription?.canChangeTo(
      newPlanKey
    );
    if (!canChangeTo) {
      throw new NotFoundException(
        `Upgrade from current plan to ${newPlanKey} is not allowed`
      );
    }
    activeSubscription.close();
    await this.subscriptionRepository.save(activeSubscription);

    // apro una nuova sottoscrizione con il nuovo piano
    const entity = {
      tenantId: activeSubscription.tenantId, // loggedUser.tenantId,
      planId: plan.id,
    };
    const instance = this.subscriptionRepository.create(entity);
    const newSubscription = await this.subscriptionRepository.save(instance);
    return newSubscription;
  }

  async upgrade(
    loggedUser: LoggedUser,
    newPlanKey: PlanKeys
  ): Promise<Subscription> {
    this.logger.log(
      `Upgrading subscription to plan ${newPlanKey}`
    );
    return this.changePlan(loggedUser, newPlanKey);
  }

  async downgrade(
    loggedUser: LoggedUser,
    newPlanKey: PlanKeys
  ): Promise<Subscription> {
    this.logger.log(
      `Downgrading subscription to plan ${newPlanKey}`
    );
    return this.changePlan(loggedUser, newPlanKey);
  }

  async findByTenantId(tenantId: string): Promise<{ exists: boolean; plan?: string }> {
    const subscription = await this.subscriptionRepository.findOne({ where: { tenantId } });
    return {
      exists: !!subscription,
      plan: subscription?.plan,
    };
  }
}
