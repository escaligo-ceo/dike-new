import {
  AppLogger,
  BaseUrl,
  DikeConfigService,
  inspect,
  OriginDto,
  Subscription,
} from "@dike/common";
import { AuditService, BaseHttpService } from "@dike/communication";
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

  async internalSubscribePlanOnTenant(
    originDto: OriginDto,
    userId: string
  ): Promise<Subscription> {
    this.logger.debug(`Assigning subscription for tenant of userId: ${userId}`);
    const url = `/v1/internal/tenants/:tenantId/subscriptions`;
    try {
      const response = await this.post(
        url,
        { userId },
        originDto
      );
      this.logger.log(
        `assignTenantSubscription response data: ${inspect(response.data)}`
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        `Error assigning subscription for tenant of userId: ${userId} - ${inspect(error)}`
      );
      if (axios.isAxiosError(error) && error.response) {
        throw new HttpException(
          error.response.data,
          error.response.status
        );
      } else {
        throw new InternalServerErrorException(
          `Failed to assign subscription for tenant of userId: ${userId}`
        );
      }
    }
  }
}
