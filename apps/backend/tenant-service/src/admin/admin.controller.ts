import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import {
  AdminAuthGuard,
  ApiGatewayService,
  AuditService,
  BaseAdminController,
  UserFactory,
} from "@dike/communication";
import {
  Controller,
  Get,
  Render,
  Req,
  UseGuards,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdminService } from "./admin.service";

@UseGuards(AdminAuthGuard)
@ApiTags("admin")
@Controller({
  path: "admin",
  version: VERSION_NEUTRAL,
})
export class AdminController extends BaseAdminController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
    protected readonly auditService: AuditService,
    protected readonly apiGatewayService: ApiGatewayService,
    protected readonly adminService: AdminService
  ) {
    super(
      new AppLogger(AdminController.name),
      configService,
      userFactory,
      auditService,
      apiGatewayService,
      adminService
    );
  }

  @UseGuards(AdminAuthGuard)
  @Get("dashboard")
  @Render("admin/dashboard")
  @ApiOperation({ summary: "Admin root view" })
  async getDashboard(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ) {
    this.logRequest(req, "getDashboard");
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    return this.adminService.getDashboard(loggedUser);
  }

  @Get("tenants")
  @Render("admin/tenants")
  @ApiOperation({ summary: "Admin tenants view" })
  async tenantsView(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ) {
    this.logRequest(req, "tenantsView");
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    // Fetch tenants from service
    const tenants = await this.adminService.getAllTenants(loggedUser);
    return { tenants };
  }

  @Get("offices")
  @Render("admin/offices")
  @ApiOperation({ summary: "Admin offices view" })
  async officesView(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ) {
    this.logRequest(req, "officesView");
    // Fetch offices from service
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const offices = await this.adminService.getAllOffices(loggedUser);
    return { offices };
  }

  @Get("tenant-memberships")
  @Render("admin/tenant-memberships")
  @ApiOperation({ summary: "Admin tenantMemberships view" })
  async tenantMembershipsView(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ) {
    this.logRequest(req, "tenantMembershipsView");
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    // Fetch tenantMemberships from service
    const tenantMemberships = await this.adminService.getAllOffices(loggedUser);
    return { tenantMemberships };
  }

  @Get("teams")
  @Render("admin/teams")
  @ApiOperation({ summary: "Admin teams view" })
  async teamsView(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ) {
    this.logRequest(req, "teamsView");
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    // Fetch teams from service
    const teams = await this.adminService.getAllTeams(loggedUser);
    return { teams };
  }

  @Get("invites")
  @Render("admin/invites")
  @ApiOperation({ summary: "Admin invites view" })
  async invitesView(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ) {
    this.logRequest(req, "invitesView");
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    // Fetch invites from service
    const invites = await this.adminService.getAllInvites(loggedUser);
    return { invites };
  }
}
