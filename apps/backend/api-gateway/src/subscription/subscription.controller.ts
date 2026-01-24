import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import { BaseController, UserFactory } from "@dike/communication";
import { Controller, Get, Param, Patch, Req, Version } from "@nestjs/common";
import { HttpSubscriptionService } from "../communication/http.subscription.service";

@Controller("subscriptions")
export class SubscriptionController extends BaseController {
  constructor(
    private readonly httpSubscriptionService: HttpSubscriptionService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory
  ) {
    super(
      new AppLogger(SubscriptionController.name),
      configService,
      userFactory
    );
  }

  @Get("tenant/:tenantId")
  @Version("1")
  async getSubscriptionsByTenant(
    @Param("tenantId") tenantId: string,
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorizationBearer: string,
    @Req() req
  ) {
    this.logRequest(req, "getSubscriptionsByTenant");
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorizationBearer
    );
    return this.httpSubscriptionService.getActiveByTenant(loggedUser, tenantId);
  }

  @Patch("upgrade")
  @Version("1")
  async upgradeSubscription(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorizationBearer: string,
    @Req() req,
    @Param("planKey") planKey: string
  ) {
    this.logRequest(req, "upgradeSubscription");
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorizationBearer
    );
    return this.httpSubscriptionService.upgradeSubscription(
      loggedUser,
      planKey
    );
  }

  @Patch("downgrade")
  @Version("1")
  async downgradeSubscription(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorizationBearer: string,
    @Req() req,
    @Param("planKey") planKey: string
  ) {
    this.logRequest(req, "downgradeSubscription");
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorizationBearer
    );
    return this.httpSubscriptionService.downgradeSubscription(
      loggedUser,
      planKey
    );
  }
}
