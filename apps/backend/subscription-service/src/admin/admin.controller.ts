import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  OriginIp,
  OriginUserAgent,
  PlanKeys,
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
  Query,
  Render,
  Req,
  UseGuards,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdminService } from "./admin.service";

@Controller({
  path: "admin",
  version: VERSION_NEUTRAL,
})
@ApiTags("admin")
@UseGuards(AdminAuthGuard)
export class AdminController extends BaseAdminController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly adminService: AdminService,
    protected readonly userFactory: UserFactory,
    protected readonly apiGatewayService: ApiGatewayService,
    protected readonly auditService: AuditService
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

  @Get("subscriptions")
  @Render("admin/subscriptions")
  @ApiOperation({ summary: "Admin subscriptions view" })
  async adminSubscriptionsView(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Query("planKey") planKey?: string,
    @Query("status") status?: string,
    @Req() req?: any
  ) {
    this.logRequest(req, "adminSubscriptionsView");
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    const subscriptions = await this.adminService.getSubscriptionsWithFilters(
      loggedUser,
      planKey as PlanKeys,
      status
    );
    const plans = await this.adminService.getAllPlans(loggedUser);

    return {
      subscriptions,
      plans,
      selectedPlanKey: planKey || PlanKeys.FREE,
      selectedStatus: status || "",
    };
  }
}
