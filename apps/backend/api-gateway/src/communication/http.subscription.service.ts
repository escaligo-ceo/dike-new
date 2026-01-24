import {
  AppLogger,
  BaseUrl,
  DikeConfigService,
  Feature,
  FeatureByTenantDto,
  inspect,
  Office,
  Plan,
  PlanKeys,
  Subscription,
} from "@dike/common";
import {
  AuditService,
  BaseHttpService,
  LoggedUser,
  PlanDto,
} from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import axios from "axios";

@Injectable()
export class HttpSubscriptionService extends BaseHttpService {
  private readonly frontendServiceParams: BaseUrl;

  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly auditService: AuditService // Assuming you have an audit service for logging errors
  ) {
    super(
      httpService,
      new AppLogger(HttpSubscriptionService.name),
      configService,
      configService.env("SUBSCRIPTION_SERVICE_URL", "http://localhost:8004/api")
    );

    const frontendServiceUrl = this.configService.env(
      "FRONTEND_URL",
      "http://localhost:5172"
    );
    this.frontendServiceParams = new BaseUrl(frontendServiceUrl);
  }

  public get frontendBaseUrl(): string {
    return this.frontendServiceParams.baseUrl();
  }

  async findFeatureInTenantByName(
    loggedUser: LoggedUser,
    { tenantId, featureName }: FeatureByTenantDto
  ): Promise<Feature> {
    const requestUrl = `/v1/${tenantId}/features?name=${featureName}`;
    try {
      const response = await this.get(requestUrl, loggedUser.token.originDto);
      return response.data;
    } catch (error) {
      this.auditService.safeLog(
        loggedUser,
        "REGISTER_USER_SUCCESS",
        `Failed to get subscription for tenant: ${tenantId}`,
        { tenantId, featureName }
      );

      if (axios.isAxiosError(error) && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }

      console.trace();
      throw new InternalServerErrorException(
        `Errore interno: ${inspect(error)}`
      );
    }
  }

  async subscribePlanOnTenant(
    loggedUser: LoggedUser,
    tenantId: string,
    { planKey }: { planKey: string }
  ): Promise<PlanKeys> {
    const requestUrl = `/v1/tenants/${tenantId}/subscriptions`;
    const response = await this.post(
      requestUrl,
      { planKey },
      loggedUser.token.originDto
    );
    return response.data;
  }

  async getPlans(loggedUser: LoggedUser): Promise<PlanDto[]> {
    const requestUrl = `/v1/plans`;
    const response = await this.get(requestUrl, loggedUser.token.originDto);
    return response.data;
  }

  async getSubscriptionByTenant(
    loggedUser: LoggedUser,
    tenantId: string
  ): Promise<any> {
    const requestUrl = `/v1/subscriptions/tenant/${tenantId}`;

    const response = await this.get(requestUrl, loggedUser.token.originDto);
    return response.data;
  }

  async subscribePlanForTenant(
    loggedUser: LoggedUser,
    tenantId: string,
    { planKey }: { planKey: PlanKeys }
  ): Promise<Subscription> {
    const requestUrl = `/v1/tenants/${tenantId}/subscriptions`;
    const response = await this.post(
      requestUrl,
      {
        tenantId,
        planKey,
      },
      loggedUser.token.originDto
    );
    return response.data;
  }

  async getActivePlanByKey(
    loggedUser: LoggedUser,
    planKey: PlanKeys
  ): Promise<Plan | null> {
    const requestUrl = `/v1/plans/${planKey}`;
    const response = await this.get(requestUrl, loggedUser.token.originDto);
    return response.data;
  }

  async createOfficeForTenant(
    loggedUser: LoggedUser,
    tenantId: string,
    body: any
  ): Promise<Office> {
    const requestUrl = `/v1/tenants/${tenantId}/offices`;
    try {
      const response = await this.post(
        requestUrl,
        body,
        loggedUser.token.originDto
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to create office for tenant in subscription service: ${inspect(error)}`
      );
      console.trace();
      throw new InternalServerErrorException(
        `Failed to create office for tenant in subscription service: ${inspect(error)}`
      );
    }
  }

  async getActiveByTenant(
    loggedUser: LoggedUser,
    tenantId: string
  ): Promise<any> {
    const requestUrl = `/v1/subscriptions/tenant/${tenantId}`;
    const response = await this.get(requestUrl, loggedUser.token.originDto);
    return response.data;
  }

  async upgradeSubscription(
    loggedUser: LoggedUser,
    planKey: string
  ): Promise<Subscription> {
    const url = `/v1/subscriptions/upgrade`;
    const response = await this.patch(
      url,
      { planKey },
      loggedUser.token.originDto
    );
    return response.data;
  }

  async downgradeSubscription(
    loggedUser: LoggedUser,
    planKey: string
  ): Promise<Subscription> {
    const url = `/v1/subscriptions/downgrade`;
    const response = await this.patch(
      url,
      { planKey },
      loggedUser.token.originDto
    );
    return response.data;
  }
}
