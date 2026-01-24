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
  Version,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdminService } from "./admin.service";

@ApiTags("admin")
@UseGuards(AdminAuthGuard)
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

  @Get("templates")
  @Version("1")
  @ApiOperation({ summary: "Admin templates view" })
  @Render("admin/templates")
  async templatesView(
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
    this.logRequest(req, `templatesView`);
    // Fetch templates from service
    const templates = await this.adminService.getAllTemplates(loggedUser);
    return { templates };
  }
}
