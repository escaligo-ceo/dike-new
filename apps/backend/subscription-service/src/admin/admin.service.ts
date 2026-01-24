import {
  AppLogger,
  Plan,
  PlanKeys,
  Subscription,
} from "@dike/common";
import { ApiGatewayService, BaseAdminService, LoggedUser } from "@dike/communication";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class AdminService extends BaseAdminService {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly apiGatewayService: ApiGatewayService,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {
    super(new AppLogger(AdminService.name), apiGatewayService);
  }

  async getSubscriptionsWithFilters(
    loggedUser: LoggedUser,
    planKey?: PlanKeys,
    status?: string
  ): Promise<Subscription[]> {
    this.logger.log(
      `Getting subscriptions with filters - planKey: ${planKey}, status: ${status}`
    );

    let query = this.subscriptionRepository
      .createQueryBuilder("subscription")
      .leftJoinAndSelect("subscription.plan", "plan");

    if (planKey) {
      query = query.where("subscription.plan_key = :planKey", { planKey });
    }

    if (status) {
      query = query.andWhere("subscription.status = :status", { status });
    }

    const subscriptions = await query.getMany();

    return subscriptions;
  }

  async getAllPlans(loggedUser: LoggedUser): Promise<Plan[]> {
    this.logger.log(`Getting all plans`);
    return this.planRepository.find();
  }
}
