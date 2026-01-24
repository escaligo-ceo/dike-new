import {
  Feature,
  FindFeatureByNameAndTenantIdDto,
  PlanKeys,
  SetPlanTypeOnTenantDto,
  Token,
} from "@dike/common";
import { Injectable } from "@nestjs/common";
import { HttpSubscriptionService } from "../communication/http.subscription.service";
import { LoggedUser } from "@dike/communication";

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly httpSubscriptionService: HttpSubscriptionService
  ) {}

  async findFeatureByNameAndTenantId(
    loggedUser: LoggedUser,
    { featureName, tenantId }: FindFeatureByNameAndTenantIdDto
  ): Promise<Feature> {
    return this.httpSubscriptionService.findFeatureInTenantByName(loggedUser, {
      tenantId,
      featureName,
    });
  }

  async setPlanTypeOnTenant(
    loggedUser: LoggedUser,
    tenantId: string,
    { planKey }: { planKey: PlanKeys }
  ): Promise<PlanKeys> {
    return this.httpSubscriptionService.subscribePlanOnTenant(
      loggedUser, 
      tenantId,
      { planKey } as { planKey: PlanKeys },
    );
  }
}
