import {
  AppLogger,
  DikeConfigService,
  inspect,
  OriginDto,
  Tenant,
} from "@dike/common";
import { BaseHttpService, LoggedUser } from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class HttpTenantService extends BaseHttpService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService
  ) {
    super(
      httpService,
      new AppLogger(HttpTenantService.name),
      configService,
      configService.env("TENANT_SERVICE_URL", "http://localhost:8007/api")
    );
  }

  async internalFindOrCreateTenant(
    originDto: OriginDto,
    userId: string
  ): Promise<Tenant> {
    this.logger.debug(
      `Finding or creating tenant for userId: ${userId}`
    );
    const url = `/v1/tenants/internal/find-or-create`;
    const response = await this.post(
      url,
      { userId },
      originDto
    );
    this.logger.log(
      `internalFindOrCreateTenant response data: ${inspect(response.data)}`
    );
    return response.data;
  }

  async internalFindOrCreateOffice(
    originDto: OriginDto,
    userId: string
  ): Promise<Tenant> {
    this.logger.debug(
      `Finding or creating tenant for userId: ${userId}`
    );
    const url = `/v1/tenants/internal/find-or-create`;
    const response = await this.post(
      url,
      { userId },
      originDto
    );
    this.logger.log(
      `internalFindOrCreateTenant response data: ${inspect(response.data)}`
    );
    return response.data;
  }

  async internalFindOrCreateTeam(
    originDto: OriginDto,
    userId: string
  ): Promise<Tenant> {
    this.logger.debug(
      `Finding or creating tenant for userId: ${userId}`
    );
    const url = `/v1/tenants/internal/find-or-create`;
    const response = await this.post(
      url,
      { userId },
      originDto
    );
    this.logger.log(
      `internalFindOrCreateTenant response data: ${inspect(response.data)}`
    );
    return response.data;
  }

  async getTenantById(
    originDto: OriginDto,
    tenantId: string
  ): Promise<Tenant> {
    this.logger.debug(`[getTenantById] tenantId: ${tenantId}`);
    const res = await this.get(
      `/v1/tenants/${tenantId}`,
      originDto
    );

    this.logger.debug(`[getTenantById] response: ${inspect(res.data)}`);
    return res.data;
  }
}
