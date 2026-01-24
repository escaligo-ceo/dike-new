import { AppLogger, DikeConfigService, FullAccessTokenDto, OriginDto, Tenant } from "@dike/common";
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

  async interlanFindOrCreateTenant(
    loggedUser: LoggedUser,
    { name }: Partial<Tenant>
  ): Promise<Tenant> {
    const url = `/v1/internal/tenants/find-or-create`;
    const response = await this.post(
      url,
      { ownerId: loggedUser.id, name },
      loggedUser.token.originDto,
      { "Content-Type": "application/json" }
    );
    return response.data;
  }

  async getTenant(
    loggedUser: LoggedUser,
    tenantId: string
  ): Promise<Tenant> {
    const url = `/v1/tenants/${tenantId}`;
    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  async generateFullAccessToken(
    loggedUser: LoggedUser,
    payload: FullAccessTokenDto
  ): Promise<string> {
    const url = `/v1/auth/full-access-token`;
    const response = await this.post(
      url,
      payload,
      loggedUser.token.originDto,
      { "Content-Type": "application/json" }
    );
    return response.data.token;
  }
}
