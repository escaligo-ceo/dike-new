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
  BaseAdminService,
  UserFactory,
} from "@dike/communication";
import { Body, Controller, Post, Req, UseGuards, Version } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { HttpAuthService } from "../communication/http.auth.service";

@Controller("admin")
@ApiTags("admin")
export class AdminController extends BaseAdminController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
    protected readonly auditService: AuditService,
    protected readonly apiGatewayService: ApiGatewayService,
    protected readonly adminService: BaseAdminService,
    private readonly httpAuthService: HttpAuthService
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
  @Version('1')
  @ApiOperation({ summary: "Admin login" })
  async loginAdmin(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Body() body,
    @Req() req
  ) {
    this.logRequest(req, "loginAdmin");
    const originDto = { originIp, originUserAgent };
    return this.httpAuthService.loginAdmin(originDto, body);
  }
}
