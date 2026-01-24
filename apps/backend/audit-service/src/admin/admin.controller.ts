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
  AuditStatsDto,
  BaseAdminController,
  UserFactory,
} from "@dike/communication";
import {
  Controller,
  Get,
  Req,
  UseGuards,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import { AdminService } from "./admin.service";

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

  @Get("stats")
  async getStats(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ): Promise<AuditStatsDto> {
    this.logRequest(req, "getStats");
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    // Restituisce le statistiche aggregate per il pannello admin
    return this.adminService.getStats(loggedUser);
  }
}
