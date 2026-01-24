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
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import {
  Controller,
  Get,
  Render,
  Req,
  UseGuards,
  Version,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ProfileService } from "../profile/profile.service";
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
    protected readonly adminService: AdminService,
    protected readonly apiGatewayService: ApiGatewayService,
    private readonly userService: ProfileService
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

  @Get("users")
  @Version(VERSION_NEUTRAL)
  @ApiOperation({ summary: "Admin users view" })
  @Render("users")
  async users(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authentication: string,
    @Req() req
  ) {
    this.logRequest(
      req,
      `users called with originIp: ${originIp}, originUserAgent: ${originUserAgent}`
    );
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authentication,
    );
    return { users: await this.userService.findInRepository(loggedUser) };
  }
}
