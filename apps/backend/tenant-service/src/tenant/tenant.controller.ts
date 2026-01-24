import {
  Analytics,
  AppLogger,
  CurrentUser,
  DikeConfigService,
  Membership,
  Office,
  OfficeDto,
  Team,
  Tenant,
} from "@dike/common";
import {
  Audit,
  AuditAction,
  AuditCategory,
  AuditService,
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
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { TeamService } from "../team/team.service";
import { OfficeService } from "./office.service";
import { TenantService } from "./tenant.service";

@UseGuards(JwtAuthGuard)
@Controller("tenants")
@ApiTags("tenants")
export class TenantController extends BaseController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly teamService: TeamService,
    private readonly officeService: OfficeService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly auditService: AuditService,
    protected readonly userFactory: UserFactory,
  ) {
    super(new AppLogger(TenantController.name), configService, userFactory);
  }

  @Get()
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Get tenants by owner ID" })
  async getTenantsByOwnerId(
    @CurrentUser() loggedUser: LoggedUser,
    @Query("ownerId") ownerId: string,
    @Req() req,
  ): Promise<Tenant[]> {
    this.logRequest(req, "getTenantsByOwnerId");
    return this.tenantService.findByOwnerId(loggedUser, ownerId);
  }

  @Post("find-or-create")
  @Version("1")
  @Audit(AuditCategory.TENANT, AuditAction.CREATE)
  @ApiOperation({ summary: "Find or create tenant for owner" })
  async findOrCreateForOwner(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() tenantData: Partial<Tenant>,
    @Req() req,
  ): Promise<[Tenant, boolean]> {
    this.logRequest(req, "findOrCreateForOwner");
    return this.tenantService.findOrCreate(loggedUser, tenantData);
  }

  @Get(":tenantId")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Get tenant by ID" })
  @ApiParam({ name: "tenantId", description: "ID del tenant" })
  async getTenant(
    @CurrentUser() loggedUser: LoggedUser,
    @Param("tenantId") tenantId: string,
    @Req() req,
  ): Promise<Tenant | null> {
    this.logRequest(req, "getTenant");
    return this.tenantService.findById(loggedUser, tenantId);
  }

  @Post(":tenantId/office")
  @Version("1")
  @Audit(AuditCategory.OFFICE, AuditAction.CREATE)
  @ApiOperation({ summary: "Create office for tenant" })
  @ApiParam({ name: "tenantId", description: "ID del tenant" })
  async createOffice(
    @CurrentUser() loggedUser: LoggedUser,
    @Param("tenantId") tenantId: string,
    @Body() officeData: Partial<Office>,
    @Req() req,
  ): Promise<[Office, boolean]> {
    this.logRequest(req, "createOffice");
    return this.officeService.findOrCreate(loggedUser, {
      ...officeData,
      tenantId,
    });
  }

  @Post(":tenantId/team")
  @Version("1")
  @Audit(AuditCategory.TEAM, AuditAction.CREATE)
  @ApiOperation({ summary: "Create team for tenant" })
  @ApiParam({ name: "tenantId", description: "ID del tenant" })
  async createTeam(
    @CurrentUser() loggedUser: LoggedUser,
    @Param("tenantId") tenantId: string,
    @Body() dto: any,
    @Req() req,
  ): Promise<Team> {
    this.logRequest(req, "createTeam");
    return this.teamService.findOrCreate({
      originIp: loggedUser.token.originIp,
      originUserAgent: loggedUser.token.originUserAgent,
      loggedUser,
      ...dto,
      tenantId,
    });
  }

  @Post(":tenantId/teams")
  @Version("1")
  @ApiOperation({ summary: "Create team for tenant" })
  @ApiParam({ name: "tenantId", description: "ID del tenant" })
  @Audit(AuditCategory.TEAM, AuditAction.CREATE)
  async createTeamForTenant(
    @CurrentUser() loggedUser: LoggedUser,
    @Param("tenantId") tenantId: string,
    @Body() dto: any,
    @Req() req,
  ): Promise<Team> {
    this.logRequest(req, "createTeamForTenant");
    return this.teamService.findOrCreate({
      originIp: loggedUser.token.originIp,
      originUserAgent: loggedUser.token.originUserAgent,
      loggedUser,
      ...dto,
      tenantId,
    });
  }

  @Get("user/:userId")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Get tenants for a specific user ID" })
  @ApiParam({ name: "userId", description: "ID dell'utente" })
  async getTenantsForUser(
    @CurrentUser() loggedUser: LoggedUser,
    @Param("userId") userId: string,
    @Req() req,
  ): Promise<Tenant[]> {
    this.logRequest(req, "getTenantsForUser");
    return this.tenantService.findTenantForUserId(loggedUser);
  }

  @Get("by-owner/:userId")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Get tenants with for a specific user ID as owner" })
  @ApiParam({ name: "userId", description: "ID dell'utente" })
  async getTenantsByOnwer(
    @CurrentUser() loggedUser: LoggedUser,
    @Param("userId") userId: string,
    @Req() req,
  ): Promise<Tenant[]> {
    this.logRequest(req, "getTenantsForUser");
    return this.tenantService.getTenantsByOnwer(loggedUser);
  }

  // @Get(":tenantId/memberships")
  // @Version("1")
  // @ApiOperation({ summary: "Get memberships for a tenant" })
  // async getMembershipsFromTenant(
  //   @OriginIp() originIp: string,
  //   @OriginUserAgent() originUserAgent: string,
  //   @AuthorizationBearer() authorization: string,
  //   @Query("ownerId") ownerId: string,
  //   @Req() req
  // ): Promise<Tenant[]> {
  //   this.logRequest(req, "getMembershipsFromTenant");
  //   const tokenDto: Token = new Token(originIp, originUserAgent, authorization);
  //   // Service derives userId from token; ignore ownerId for now
  //   return this.tenantService.findTenantForUserId(tokenDto);
  // }

  @Post(":tenantId/memberships/find-or-create")
  @Version("1")
  @Audit(AuditCategory.MEMBERSHIP, AuditAction.CREATE)
  @ApiOperation({ summary: "Create membership between a tenant and a user" })
  @ApiParam({ name: "tenantId", description: "ID del tenant" })
  async findOrCreateMembershipBetweenTenantAndUser(
    @CurrentUser() loggedUser: LoggedUser,
    @Param("tenantId") tenantId: string,
    @Body() { userId, role }: { userId: string; role: string },
    @Req() req,
  ): Promise<[Membership, boolean]> {
    this.logRequest(req, "findOrCreateMembershipBetweenTenantAndUser");
    return this.tenantService.findOrCreateMembershipBetweenTenantAndUser(
      loggedUser,
      tenantId,
      { userId, role },
    );
  }

  @Post(":tenantId/office/find-or-create")
  @Version("1")
  @Audit(AuditCategory.OFFICE, AuditAction.CREATE)
  @ApiOperation({ summary: "Create an office by tenant" })
  @ApiParam({ name: "tenantId", description: "ID del tenant" })
  async findOrCreateOfficeOnTenant(
    @CurrentUser() loggedUser: LoggedUser,
    @Param("tenantId") tenantId: string,
    @Body() { name, address, partitaIVA }: OfficeDto,
    @Req() req,
  ): Promise<[Office, boolean]> {
    this.logRequest(req, "findOrCreateOfficeOnTenant");
    return this.tenantService.findOrCreateOfficeOnTenant(loggedUser, tenantId, {
      name,
      address,
      partitaIVA,
    });
  }

  @Get(":tenantId")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Get tenant by ID" })
  @ApiParam({ name: "tenantId", description: "ID del tenant" })
  async findTenantById(
    @CurrentUser() loggedUser: LoggedUser,
    @Param("tenantId") tenantId: string,
    @Req() req,
  ): Promise<Tenant | null> {
    this.logRequest(req, "findTenantById");
    return this.tenantService.findTenantById(loggedUser, tenantId);
  }
}
