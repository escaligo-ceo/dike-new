import {
  AccessResponse,
  AppLogger,
  DikeConfigService,
  ILoginResult,
  inspect,
  LoginUserDto,
  OriginDto,
} from "@dike/common";
import { BaseHttpService } from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class HttpProcessService extends BaseHttpService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService
  ) {
    super(
      httpService,
      new AppLogger(HttpProcessService.name),
      configService,
      configService.env("PROCESS_SERVICE_URL", "http://localhost:3001/api")
    );
  }

  async login(
    originDto: OriginDto,
    payload: LoginUserDto
  ): Promise<AccessResponse> {
    const response = await this.post(`/v1/auth/login`, payload, originDto);

    this.logger.debug(`[login] response: ${inspect(response.data)}`);
    return response.data;
  }

  // async createTeamForTenants(
  //   loggedUser: LoggedUser,
  //   { teamName, tenantId, inviteEmails }: createTeamForTenantsByTenantIdDto
  // ) {
  //   const payload = { teamName, inviteEmails };
  //   const response = await this.post(
  //     `/v1/team/${tenantId}`,
  //     payload,
  //     loggedUser.token.originDto
  //   );
  //   // const team = response.data;
  //   // this.logger.debug(`Team created: ${inspect(team)}`);
  //   // return team;
  //   const { url } = response;
  //   this.logger.debug(
  //     `[createTeamForTenants] response (${url}): ${inspect(response.data)}`
  //   );
  //   return response.data;
  // }

  // async findOrCreateTenantForOwner(
  //   loggedUser: LoggedUser,
  //   tenantData: Partial<Tenant>,
  //   ownerId: string
  // ): Promise<[Tenant, boolean]> {
  //   this.logger.log(`[findOrCreateTenantForOwner] tenantData: ${inspect(tenantData)}`);
  //   const res = await this.post(
  //     `/v1/tenants/find-or-create`,
  //     { ...tenantData, ownerId },
  //     loggedUser.token.originDto
  //   );

  //   this.logger.debug(`response: ${inspect(res.data)}`);
  //   return res.data;
  // }

  // async findOrCreateOffice(
  //   loggedUser: LoggedUser,
  //   tenantData: Partial<Tenant>,
  //   ownerId: string
  // ): Promise<[Office, boolean]> {
  //   this.logger.log(`[findOrCreateOffice] tenantData: ${inspect(tenantData)}`);

  //   const res = await this.post(
  //     `/v1/office/find-or-create`,
  //     { ...tenantData, ownerId },
  //     loggedUser.token.originDto
  //   );

  //   this.logger.debug(`response: ${inspect(res.data)}`);
  //   return res.data;
  // }

  // async getTenantById(
  //   loggedUser: LoggedUser,
  //   tenantId: string
  // ): Promise<Tenant> {
  //   this.logger.debug(`[getTenantById] tenantId: ${tenantId}`);
  //   const res = await this.get(
  //     `/v1/tenants/${tenantId}`,
  //     loggedUser.token.originDto
  //   );

  //   this.logger.debug(`[getTenantById] response: ${inspect(res.data)}`);
  //   return res.data;
  // }

  // async findOrCreateOfficeOnTenant(
  //   loggedUser: LoggedUser,
  //   tenantId: string,
  //   officeData: Partial<Office>
  // ): Promise<[Office, boolean]> {
  //   this.logger.log(`[findOrCreateOfficeOnTenant] tenantId: ${tenantId}, officeData: ${inspect(officeData)}`);

  //   const res = await this.post(
  //     `/v1/tenants/${tenantId}/office/find-or-create`,
  //     officeData,
  //     loggedUser.token.originDto
  //   );

  //   this.logger.debug(`response: ${inspect(res.data)}`);
  //   return res.data;
  // }

  // async findTenantById(
  //   loggedUser: LoggedUser,
  //   tenantId?: string
  // ): Promise<Tenant | null> {
  //   const res = await this.get(
  //     `/v1/tenants/${tenantId ?? loggedUser.tenantId}`,
  //     loggedUser.token.originDto
  //   );
  //   this.logger.debug(`response: ${inspect(res.data)}`);
  //   return res.data;
  // }

  // async findTenantsForUserId(
  //   loggedUser: LoggedUser,
  //   userId: string
  // ): Promise<Tenant[]> {
  //   const response = await this.get(
  //     `v1/tenants/user/${userId}`,
  //     loggedUser.token.originDto
  //   );
  //   this.logger.debug(`response: ${inspect(response.data)}`);
  //   return response.data;
  // }

  // async findOrCreateMembershipBetweenTenantAndUser(
  //   loggedUser: LoggedUser,
  //   { userId, role }: { userId: string; role: string },
  //   tenantId: string,
  // ): Promise<[Membership, boolean]> {
  //   this.logger.log(`[findOrCreateMembershipBetweenTenantAndUser] tenantId: ${tenantId}, userId: ${userId}, role: ${role}`);

  //   const res = await this.post(
  //     `/v1/tenants/${tenantId}/memberships/find-or-create`,
  //     { userId, role },
  //     loggedUser.token.originDto
  //   );

  //   this.logger.debug(`response: ${inspect(res.data)}`);
  //   return res.data;
  // }

  // async findOrCreateOfficeByTenant(
  //   loggedUser: LoggedUser,
  //   tenantId: string,
  //   officeData: OfficeDto
  // ): Promise<[Office, boolean]> {
  //   this.logger.log(`[findOrCreateOfficeByTenant] tenantId: ${tenantId}, officeData: ${inspect(officeData)}`);

  //   const res = await this.post(
  //     `/v1/tenants/${tenantId}/office/find-or-create`,
  //     officeData,
  //     loggedUser.token.originDto
  //   );

  //   this.logger.debug(`response: ${inspect(res.data)}`);
  //   return res.data;
  // }

  // async getMembershipsByUserId(
  //   loggedUser: LoggedUser,
  //   userId?: string
  // ): Promise<Membership[]> {
  //   const response = await this.get(
  //     `/v1/memberships/${userId}`,
  //     loggedUser.token.originDto
  //   );
  //   this.logger.debug(`response: ${inspect(response.data)}`);
  //   return response.data;
  // }
}
