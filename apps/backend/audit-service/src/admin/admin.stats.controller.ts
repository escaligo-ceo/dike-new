import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import {
  AuditStatsDto,
  BaseController,
  JwtAuthGuard,
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

@UseGuards(JwtAuthGuard)
@Controller({
  path: "admin/stats",
  version: VERSION_NEUTRAL,
})
export class AdminStatsController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    private readonly adminService: AdminService,
    protected readonly userFactory: UserFactory
  ) {
    super(new AppLogger(AdminStatsController.name), configService, userFactory);
  }

  @Get()
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
    return this.adminService.getStats(loggedUser);
  }
}
