import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  Office,
  OriginIp,
  OriginUserAgent,
  PlanKeys,
  Subscription,
} from "@dike/common";
import { BaseController, JwtAuthGuard, UserFactory } from "@dike/communication";
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";
import { HttpSubscriptionService } from "../communication/http.subscription.service";

@UseGuards(JwtAuthGuard)
@Controller("tenants")
export class TenantController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    private readonly httpSubscriptionService: HttpSubscriptionService,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory
  ) {
    super(new AppLogger(TenantController.name), configService, userFactory);
  }

  @Post(":tenantId/subscriptions")
  @Version("1")
  @HttpCode(HttpStatus.OK)
  // @ApiBody({ type: createTeamForTenantsByTenantIdDto })
  async subscribePlanForTenant(
    @Body()
    { planKey }: { planKey: PlanKeys },
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Param("tenantId") tenantId: string,
    @Req() req
  ): Promise<Subscription | null> {
    this.logRequest(req, `subscribePlanForTenant`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpSubscriptionService.subscribePlanForTenant(
      loggedUser,
      tenantId,
      { planKey }
    );
  }

  @Post(":tenantId/offices")
  @Version("1")
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: Object })
  async createOfficeForTenant(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Param("tenantId") tenantId: string,
    @Body() body: any,
    @Req() req
  ): Promise<Office> {
    this.logRequest(req, `createOfficeForTenant`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpSubscriptionService.createOfficeForTenant(
      loggedUser,
      tenantId,
      body
    );
  }
}
