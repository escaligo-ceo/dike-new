import {
  AppLogger,
  AuthorizationBearer,
  CurrentUser,
  DikeConfigService,
  inspect,
  IPingResponse,
  Membership,
  OriginIp,
  OriginUserAgent,
  PlanKeys,
  SubscriptionResponse,
} from "@dike/common";
import {
  ApiGatewayService,
  Audit,
  AuditAction,
  AuditCategory,
  AuditService,
  JwtAuthGuard,
  KeycloakService,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Render,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  private readonly _appUrl: string | undefined;

  get appUrl(): string {
    return this._appUrl ?? "";
  }

  constructor(
    protected readonly configService: DikeConfigService,
    private readonly appService: AppService,
    private readonly auditService: AuditService,
    private readonly logger: AppLogger,
    private readonly apiGatewayService: ApiGatewayService,
    private readonly keycloakService: KeycloakService,
    private readonly userFactory: UserFactory
  ) {
    this._appUrl = this.configService.env("APP_URL", "web-site");
    this.logger = new AppLogger(AppController.name);
  }

  @Get("ping")
  @Header("Content-Type", "application/json")
  ping(): IPingResponse {
    return this.appService.ping();
  }

  @Get()
  @Render("main")
  getMain() {
    return {
      title: "Benvenuto",
    };
  }

  @Get("register")
  @Render("auth/register")
  async getRegister(@Req() req, @Res() res) {
    return {
      csrfToken: req.csrfToken ? req.csrfToken() : "",
      title: "Register",
    };
  }

  @Get("login")
  @Render("auth/login")
  getLogin(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req) {
    return {
      csrfToken: req.csrfToken ? req.csrfToken() : "",
      title: "Login",
    };
  }

  private async getSubscription(
    originIp: string,
    originUserAgent: string,
    authorization: string,
    loggedUser: LoggedUser,
    resolvedTenantId: string | null
  ): Promise<SubscriptionResponse> {
    let subscription;
    try {
      if (!resolvedTenantId) {
        throw new NotFoundException(
          "No tenantId available for subscription retrieval"
        );
      }
      // Fetch subscription via API using resolved tenantId
      return this.apiGatewayService.getSubscriptionByTenant(
        loggedUser,
        resolvedTenantId
      );
    } catch (error) {
      this.logger.warn(
        `Could not retrieve subscription for tenant ${loggedUser.tenantId}: ${inspect(error)}`
      );
      subscription = {
        name: "free",
        description: null,
        monthlyPrice: 0,
        status: "active",
        startDate: null,
        endDate: null,
        planKey: PlanKeys.FREE,
      };
    }
    return subscription;
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  @Render("profile")
  async getProfile(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ) {
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    const profile = await loggedUser.getProfile();
    // Resolve tenant via available identifiers (prefer token payload, fallback to profile.defaultTenantId)
    const resolvedTenantId =
      loggedUser.tenantId || profile?.tenantId || null;
    let tenant: any = null;
    try {
      if (resolvedTenantId) {
        // Prefer explicit API call using the resolved tenantId via the loggedUser token
        tenant = await this.apiGatewayService.findTenantById(
          loggedUser["tokenDto"],
          resolvedTenantId
        );
      }
    } catch (error) {
      this.logger.warn(
        `Could not retrieve tenant for user ${profile?.id} tenantId=${resolvedTenantId}`
      );
    }

    const subscription = this.getSubscription(
      originIp,
      originUserAgent,
      authorization,
      loggedUser,
      resolvedTenantId
    );

    const accessToken = req.cookies?.access_token;

    this.logger.log(inspect(subscription));

    return {
      title: "Profilo",
      userProfile: profile,
      accessToken,
      appUrl: this.appUrl,
      subscription,
      tenant,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("settings")
  @Render("settings")
  async getSettings(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ) {
    // Create loggedUser manually
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    const profile = await loggedUser.getProfile();
    const tenant = await loggedUser.getTenant();
    const memberships: Membership[] =
      await this.apiGatewayService.getMembershipsByUserId(loggedUser);

    this.logger.debug(
      `User with id: ${loggedUser.id} accessed settings page and tenant: ${inspect(tenant)}`
    );

    const { visibility } = profile;

    return {
      title: "Impostazioni",
      userProfile: profile,
      appUrl: this.appUrl,
      tenant,
      visibility,
      visibilityPublic: "Pubblico",
      visibilityTenant: tenant.name,
      visibilityTeam: "Team",
      visibilityPrivate: "Privato",
      memberships,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("dashboard")
  @Render("dashboard")
  @Audit(AuditCategory.DASHBOARD, AuditAction.ACCESS)
  async getDashboard(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ) {
    // Create loggedUser manually
    const loggedUser = this.userFactory.fromToken(
      (req as any).user,
      originIp,
      originUserAgent,
      authorization
    );

    const profile = await loggedUser.getProfile();

    this.logger.debug(
      `User with id: ${loggedUser.id} accessed the dashboard with profile: ${JSON.stringify(
        profile
      )}`
    );

    // this.auditService.safeLog(
    //   loggedUser,
    //   "DASHBOARD_ACCESSING",
    //   `User with id: ${loggedUser.id} accessed the dashboard`,
    //   { userId: loggedUser.id }
    // );

    this.logger.error(inspect(profile));
    return {
      title: "Dashboard",
      userProfile: profile,
      appUrl: this.appUrl,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("notifications")
  @Render("notifications")
  @Audit(AuditCategory.NOTIFICATIONS, AuditAction.ACCESS)
  async getNotifications(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ) {
    // Create loggedUser manually
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    const userProfile = await loggedUser.getProfile();

    this.logger.debug(
      `User with id: ${loggedUser.id} accessed notifications with profile: ${JSON.stringify(
        userProfile
      )}`
    );

    // this.auditService.safeLog(
    //   loggedUser,
    //   "NOTIFICATIONS_ACCESSING",
    //   `User with id: ${loggedUser.id} accessed notifications`,
    //   { userId: loggedUser.id }
    // );
    this.logger.error(inspect(userProfile));
    return {
      title: "Notifications",
      userProfile,
      appUrl: this.appUrl,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("billings")
  @Render("billings")
  @Audit(AuditCategory.DASHBOARD, AuditAction.ACCESS)
  async getBilling(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ) {
    // Create loggedUser manually
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    const userProfile = await loggedUser.getProfile();
    const tenant = await loggedUser.getTenant();

    this.logger.debug(
      `User with id: ${loggedUser.id} accessed the billing with profile: ${JSON.stringify(
        userProfile
      )}`
    );

    // this.auditService.safeLog(
    //   loggedUser,
    //   "DASHBOARD_ACCESSING",
    //   `User with id: ${loggedUser.id} accessed the billing`,
    //   { userId: loggedUser.id }
    // );

    this.logger.error(inspect(userProfile));

    return {
      title: "Fatturazione e Abbonamenti",
      userProfile,
      appUrl: this.appUrl,
      subscription: await this.getSubscription(
        originIp,
        originUserAgent,
        authorization,
        loggedUser,
        tenant.id
      ),
      tenant,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("emails")
  @Render("emails")
  @Audit(AuditCategory.DASHBOARD, AuditAction.ACCESS)
  async getEmails(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ) {
    // Create loggedUser manually
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    const userProfile = await loggedUser.getProfile();

    this.logger.debug(
      `User with id: ${loggedUser.id} accessed the billing with profile: ${JSON.stringify(
        userProfile
      )}`
    );

    // this.auditService.safeLog(
    //   loggedUser,
    //   "DASHBOARD_ACCESSING",
    //   `User with id: ${loggedUser.id} accessed the billing`,
    //   { userId: loggedUser.id }
    // );

    this.logger.error(inspect(userProfile));

    // Resolve tenant via available identifiers (prefer token payload, fallback to profile.defaultTenantId)
    const tenant = await loggedUser.getTenant();

    return {
      title: "Emails",
      userProfile,
      appUrl: this.appUrl,
      tenant,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("people")
  @Render("contact/people")
  @Audit(AuditCategory.DASHBOARD, AuditAction.ACCESS)
  async getPeople(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req
  ) {
    // Create loggedUser manually
    const userProfile = await loggedUser.getProfile();

    this.logger.debug(
      `User with id: ${loggedUser.id} accessed the dashboard with profile: ${JSON.stringify(
        userProfile
      )}`
    );

    const accessToken = req.cookies?.access_token;

    // this.auditService.safeLog(
    //   loggedUser,
    //   "DASHBOARD_ACCESSING",
    //   `User with id: ${loggedUser.id} accessed the dashboard`,
    //   { userId: loggedUser.id }
    // );

    this.logger.error(inspect(userProfile));
    return {
      title: "Dashboard",
      userProfile,
      accessToken,
      appUrl: this.appUrl,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("security")
  @Render("security")
  async getSecurity(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ) {
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    const userProfile = await loggedUser.getProfile();

    return {
      title: "Password & Autenticazione",
      userProfile,
      appUrl: this.appUrl,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  @Render("me")
  getMe(@Req() req) {
    const loggedUser = req.loggedUser as LoggedUser;
    return {
      title: "Your Profile",
      description: "Manage your application profile here.",
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get("organizations")
  @Render("organizations")
  async getOrganizations(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ) {
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const userProfile = await loggedUser.getProfile();
    const memberships = await this.apiGatewayService.getMembershipsByUserId(
      loggedUser,
      loggedUser.id
    );

    this.logger.debug(
      `User with id: ${loggedUser.id} accessed the organizations: ${JSON.stringify(memberships)}`
    );

    return {
      title: "Studi Legali & Aziende",
      userProfile,
      appUrl: this.appUrl,
      memberships,
    };
  }
}
