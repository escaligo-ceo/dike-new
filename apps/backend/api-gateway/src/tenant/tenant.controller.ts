import {
  AppLogger,
  AuthorizationBearer,
  createTeamForTenantsByTenantIdDto,
  DikeConfigService,
  inspect,
  Membership,
  Office,
  OfficeDto,
  OriginIp,
  OriginUserAgent,
  Tenant,
  userIdFromToken,
} from "@dike/common";
import {
  BaseController,
  JwtAuthGuard,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { HttpSubscriptionService } from "../communication/http.subscription.service";
import { HttpTenantService } from "../communication/http.tenant.service";

@UseGuards(JwtAuthGuard)
@ApiTags("tenants")
@Controller("tenants")
export class TenantController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    private readonly httpTenantService: HttpTenantService,
    private readonly httpSubscriptionService: HttpSubscriptionService,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory
  ) {
    super(new AppLogger(TenantController.name), configService, userFactory);
  }

  @Post("find-or-create")
  @Version("1")
  @ApiOperation({ summary: "Crea o trova un tenant per un owner" })
  @ApiBody({ type: createTeamForTenantsByTenantIdDto })
  async create(
    @Body() tenantData: Partial<Tenant>,
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ): Promise<[Tenant, boolean]> {
    this.logRequest(req, `findOrCreateTenantForOwner`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpTenantService.findOrCreateTenantForOwner(
      loggedUser,
      tenantData,
      tenantData.ownerId || userIdFromToken(authorization)
    );
  }

  @Get()
  @Version("1")
  @ApiOperation({ summary: "Ottieni tutti i tenant per ownerId" })
  async getTenants(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Query("ownerId") ownerId: string,
    @Req() req
  ) {
    this.logRequest(req, `getTenants`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const tenants: Tenant[] = await this.httpTenantService.getTenantsByOwnerId(
      loggedUser,
      ownerId
    );
    this.logger.debug(`getTenants returned: ${inspect(tenants)}`);
    return tenants;
  }

  @Get(":tenantId")
  @Version("1")
  @ApiOperation({ summary: "Ottieni un tenant per ID" })
  @ApiParam({ name: "tenantId", description: "ID del tenant" })
  async getTenantById(
    @Param("tenantId") tenantId: string,
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ): Promise<Tenant | null> {
    this.logRequest(req, `getTenantById`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const tenant: Tenant | null = await this.httpTenantService.findTenantById(
      loggedUser,
      tenantId
    );
    this.logger.debug(`getTenantById returned: ${inspect(tenant)}`);
    return tenant;
  }

  @Post(":tenantId/subscriptions")
  @Version("1")
  @ApiOperation({ summary: "Abbonare un piano a un tenant" })
  @ApiParam({ name: "tenantId", description: "ID del tenant" })
  async subscribePlanOnTenant(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Param("tenantId") tenantId: string,
    @Req() req,
    @Body() { planKey }: { planKey: string }
  ): Promise<any> {
    this.logRequest(req, "subscribePlanOnTenant");
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpSubscriptionService.subscribePlanOnTenant(
      loggedUser,
      tenantId,
      { planKey }
    );
  }

  @Post(":tenantId/office/find-or-create")
  @Version("1")
  @ApiOperation({ summary: "Crea o trova un office per un tenant" })
  @ApiParam({ name: "tenantId", description: "ID del tenant" })
  async findOrCreateOfficeOnTenant(
    @Body() officeData: Partial<Office>,
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Param("tenantId") tenantId: string,
    @Req() req
  ): Promise<[Office, boolean]> {
    this.logRequest(req, `findOrCreateOfficeOnTenant`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpTenantService.findOrCreateOfficeOnTenant(
      loggedUser,
      tenantId,
      officeData
    );
  }

  @Get("user/:userId")
  @Version("1")
  @ApiOperation({ summary: "Ottieni tutti i tenant per userId" })
  @ApiParam({ name: "userId", description: "ID dell'utente" })
  async getTenantsForUserId(
    @Param("userId") userId: string,
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ): Promise<Tenant[]> {
    this.logRequest(req, `getTenantsForUserId`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const tenants: Tenant[] = await this.httpTenantService.findTenantsForUserId(
      loggedUser,
      userId
    );
    this.logger.debug(`getTenantsForUserId returned: ${inspect(tenants)}`);
    return tenants;
  }

  @Post(":tenantId/memberships/find-or-create")
  @Version("1")
  @ApiOperation({ summary: "Crea o trova un membership per un tenant" })
  @ApiParam({ name: "tenantId", description: "ID del tenant" })
  @ApiBody({ type: createTeamForTenantsByTenantIdDto })
  async findOrCreateMembershipBetweenTenantAndUser(
    @Param("tenantId") tenantId: string,
    @Body() { userId, role }: { userId: string; role: string },
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ): Promise<[Membership, boolean]> {
    this.logRequest(req, `findOrCreateMembershipBetweenTenantAndUser`);
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    const [membership, created] =
      await this.httpTenantService.findOrCreateMembershipBetweenTenantAndUser(
        loggedUser,
        { userId, role },
        tenantId
      );
    this.logger.debug(
      `findOrCreateMembershipBetweenTenantAndUser returned: ${inspect(membership)}`
    );
    return [membership, created];
  }

  @Post(":tenantId/office/find-or-create")
  @Version("1")
  @ApiOperation({ summary: "Crea o trova un office per un tenant" })
  @ApiParam({ name: "tenantId", description: "ID del tenant" })
  @ApiBody({ type: createTeamForTenantsByTenantIdDto })
  async findOrCreateOfficeByTenant(
    @Param("tenantId") tenantId: string,
    @Body() body: OfficeDto,
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ): Promise<[Office, boolean]> {
    this.logRequest(req, `findOrCreateOfficeByTenant`);
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    const [office, created] =
      await this.httpTenantService.findOrCreateOfficeByTenant(
        loggedUser,
        tenantId,
        body
      );
    this.logger.debug(
      `findOrCreateOfficeByTenant returned: ${inspect(office)}`
    );
    return [office, created];
  }
}
