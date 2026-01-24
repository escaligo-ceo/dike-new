import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  inspect,
  LoginUserDto,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import {
  AdminAuthGuard,
  ApiGatewayService,
  AuditService,
  BaseAdminController,
  KeycloakService,
  UserFactory,
} from "@dike/communication";
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Redirect,
  Render,
  Req,
  UseGuards,
  Version,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import { ApiOperation, ApiParam } from "@nestjs/swagger";
import { AuthService } from "../auth/auth.service";
import { AdminService } from "./admin.service";
import { log } from "console";

@Controller("admin")
export class AdminController extends BaseAdminController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
    protected readonly auditService: AuditService,
    protected readonly adminService: AdminService,
    protected readonly apiGatewayService: ApiGatewayService,
    private readonly authService: AuthService,
    private readonly keycloakService: KeycloakService
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

  @Post("auth/login")
  @Version("1")
  @ApiOperation({ summary: "Admin login" })
  async loginAdmin(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Body() body: LoginUserDto,
    @Req() req
  ) {
    this.logRequest(req, "loginAdmin");
    const loggedUser = this.userFactory.fromToken(
      undefined,
      originIp,
      originUserAgent,
      authorization
    );
    return this.authService.loginAdmin(loggedUser, body);
  }

  @Get("users")
  @UseGuards(AdminAuthGuard)
  @Version(VERSION_NEUTRAL)
  @Render("users")
  @ApiOperation({ summary: "View users" })
  async users(
    @OriginIp() originIp: string,
    @AuthorizationBearer() authorization: string,
    @OriginIp() originUserAgent: string,
    @Req() req
  ) {
    this.logRequest(req, "admin");
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    this.logger.debug(`Fetching users for admin view`);
    const users = await this.keycloakService.getUsers(loggedUser);
    this.logger.debug(`Fetched users: ${inspect(users)}`);
    return { users };
  }

  @Post("users/:userId/delete")
  @UseGuards(AdminAuthGuard)
  @Version(VERSION_NEUTRAL)
  @Redirect("/admin/users", HttpStatus.SEE_OTHER) // dopo la cancellazione torna alla lista
  @ApiOperation({ summary: "Delete user via POST" })
  @ApiParam({ name: "userId", description: "ID of the user to delete" })
  async deleteViaPost(
    @OriginIp() originIp: string,
    @AuthorizationBearer() authorization: string,
    @OriginIp() originUserAgent: string,
    @Param("userId") userId: string,
    @Req() req
  ) {
    this.logRequest(req, `Deleting user via POST with ID: ${userId}`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    this.logger.debug(`Deleting user via POST with ID: ${userId}`);
    await this.keycloakService.deleteUser(loggedUser, userId);
    // non serve fare altro: il Redirect si occuperà della risposta
  }

  @Post("users/resend-verification")
  @UseGuards(AdminAuthGuard)
  @Version('1')
  @ApiOperation({ summary: "Resend verification email to user" })
  async generateEmailVerificationToken(
    @OriginIp() originIp: string,
    @AuthorizationBearer() authorization: string,
    @OriginIp() originUserAgent: string,
    @Req() req
  ) {
    this.logRequest(req, `generateEmailVerificationToken`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    await this.adminService.generateEmailVerificationToken(loggedUser);
    return { success: true };
  }

  @Get("watched-persons")
  @UseGuards(AdminAuthGuard)
  @Version(VERSION_NEUTRAL)
  @ApiOperation({ summary: "View watched persons" })
  @Render("watched-person")
  async watchedPersons(
    @OriginIp() originIp: string,
    @AuthorizationBearer() authorization: string,
    @OriginIp() originUserAgent: string,
    @Req() req
  ) {
    this.logRequest(req, "admin");
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const watchedPersons =
      await this.adminService.getWatchedPersons(loggedUser);
    this.logger.debug(`Fetched watched persons: ${inspect(watchedPersons)}`);
    return { watchedPersons };
  }
}
