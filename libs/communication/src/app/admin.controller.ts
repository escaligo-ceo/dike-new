import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  LoginUserDto,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { ApiGatewayService } from "../api-gateway.service";
import { AuditService } from "../audit/audit.service";
import { UserFactory } from "../user/user-factory";
import { AdminAuthGuard } from "../guards/admin-jwt-auth.guard";
import { BaseAdminService } from "./base-admin.service";
import { BaseController } from "./base.controller";

@Controller({
  path: "admin",
  version: VERSION_NEUTRAL,
})
export class BaseAdminController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
    protected readonly auditService: AuditService,
    protected readonly apiGatewayService: ApiGatewayService,
    protected readonly adminService: BaseAdminService
  ) {
    super(new AppLogger(BaseAdminController.name), configService, userFactory);
    this.logger = logger;
    this.configService = configService;
    this.userFactory = userFactory;
    this.auditService = auditService;
    this.apiGatewayService = apiGatewayService;
    this.adminService = adminService;
  }

  @UseGuards(AdminAuthGuard)
  @Get()
  @ApiOperation({ summary: "Admin root view" })
  @Render("admin/index")
  async root(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req,
    @Res() res
  ) {
    return { message: "Admin Base Controller Root" };
  }

  @Get("login")
  @Render("admin/login")
  @ApiOperation({ summary: "Render admin login page" })
  renderLoginPage(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    this.logRequest(req, "Rendering admin login page");
    return {};
  }

  @Post("login")
  @ApiOperation({ summary: "Admin login" })
  async adminLogin(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @Body() body: LoginUserDto,
    @Req() req,
    @Res() res
  ) {
    this.logRequest(req, `adminLogin`);

    const originDto = { originIp, originUserAgent };
    const response = await this.apiGatewayService.loginAdmin(originDto, body);

    res.cookie("access_token", response.access_token, {
      httpOnly: true,
      secure: false, // true in prod
      sameSite: "lax",
      path: "/",
    });

    this.logger.debug(`Redirecting to /admin/dashboard`);
    res.redirect("/admin/dashboard");
  }
}
