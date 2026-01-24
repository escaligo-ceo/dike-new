import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import {
  BaseController,
  IKeycloakUser,
  UserFactory,
} from "@dike/communication";
import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";

@Controller("users")
export class UsersController extends BaseController {
  constructor(
    private readonly authService: AuthService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory
  ) {
    super(new AppLogger(UsersController.name), configService, userFactory);
  }

  @Get()
  async findUserByEmail(
    @Param("email") email: string,
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authentication: string,
    @Req() req
  ): Promise<IKeycloakUser> {
    this.logRequest(req, `Finding user by email`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authentication,
    );
    return this.authService.findUserByEmail(loggedUser, email);
  }

  @Post(":userId/email-verification")
  async saveEmailVerificationToken(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authentication: string,
    @Body("token") verificationToken: string,
    @Param("userId") userId: string,
    @Req() req
  ): Promise<void> {
    this.logRequest(req, `Saving email verification token for user ${userId}`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authentication,
    );
    return this.authService.saveEmailVerificationToken(
      loggedUser,
      userId,
      verificationToken
    );
  }

  @Get("dashboard")
  async getDashboardData(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authentication: string,
    @Req() req
  ): Promise<{
    contacts: number;
    invoices: number;
    matters: number;
    documents: number;
  }> {
    this.logRequest(req, `Getting dashboard data`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authentication,
    );
    return loggedUser.dashboardData();
  }
}
