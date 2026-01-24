import {
  Analytics,
  AppLogger,
  CurrentUser,
  DikeConfigService,
  PlanKeys,
  Subscription,
  SubscriptionResponse,
} from "@dike/common";
import {
  Audit,
  AuditAction,
  AuditCategory,
  BaseController,
  JwtAuthGuard,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { SubscriptionService } from "./subscription.service";

@ApiTags("subscriptions")
@UseGuards(JwtAuthGuard)
@Controller("subscriptions")
export class SubscriptionController extends BaseController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
  ) {
    super(
      new AppLogger(SubscriptionController.name),
      configService,
      userFactory,
    );
  }

  @Get()
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Recupera tutte le abbonamenti" })
  async getSubscriptions(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ): Promise<Subscription[]> {
    this.logRequest(req, "getSubscriptions");
    return this.subscriptionService.getAll(loggedUser);
  }

  @Get(":tenantId")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Recupera l'abbonamento per tenantId" })
  async getSubscription(
    @Param("tenantId") tenantId: string,
    @CurrentUser() loggedUser: LoggedUser,
  ) {
    const subscription =
      await this.subscriptionService.findByTenantId(tenantId);
    if (!subscription) {
      throw new NotFoundException(
        `Subscription for tenant ${tenantId} not found`,
      );
    }
    return subscription;
  }

  @Get("tenant/:tenantId")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Recupera gli abbonamenti attivi per tenantId" })
  @ApiParam({ name: "tenantId", description: "ID del tenant" })
  async getSubscriptionsByTenant(
    @Param("tenantId") tenantId: string,
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ): Promise<SubscriptionResponse> {
    this.logRequest(req, "getSubscriptionsByTenant");
    return this.subscriptionService.getActiveByTenant(loggedUser, tenantId);
  }

  /**
   * Upgrade della sottoscrizione
   */
  @Patch("upgrade")
  @Version("1")
  @Audit(AuditCategory.SUBSCRIPTION, AuditAction.UPDATE)
  @ApiOperation({ summary: "Upgrade della sottoscrizione" })
  async upgrade(
    @Body("planKey") newPlanKey: string,
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ) {
    this.logRequest(req, "upgrade");
    const subscription = await this.subscriptionService.upgrade(
      loggedUser,
      newPlanKey as PlanKeys,
    );
    return { success: true, subscription };
  }

  /**
   * Downgrade della sottoscrizione
   */
  @Patch("downgrade")
  @Version("1")
  @Audit(AuditCategory.SUBSCRIPTION, AuditAction.UPDATE)
  @ApiOperation({ summary: "Downgrade della sottoscrizione" })
  async downgrade(
    @Body("planKey") newPlanKey: string,
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ) {
    this.logRequest(req, "downgrade");
    const subscription = await this.subscriptionService.downgrade(
      loggedUser,
      newPlanKey as PlanKeys,
    );
    return { success: true, subscription };
  }
}
