import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  OriginIp,
  OriginUserAgent,
  Plan,
  PlanKeys,
} from "@dike/common";
import {
  BaseController,
  JwtAuthGuard,
  PlanDto,
  UserFactory,
} from "@dike/communication";
import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HttpSubscriptionService } from "../communication/http.subscription.service";

@UseGuards(JwtAuthGuard)
@Controller("plans")
@ApiTags("Subscription Plans")
export class PlanController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    private readonly httpSubscriptionService: HttpSubscriptionService,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory
  ) {
    super(new AppLogger(PlanController.name), configService, userFactory);
  }

  @Get()
  @Version("1")
  async getPlans(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ): Promise<PlanDto[]> {
    this.logRequest(req, `getPlans`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpSubscriptionService.getPlans(loggedUser);
  }

  @Get(":planKey")
  @Version("1")
  async getActivePlanByKey(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req,
    @Param("planKey") planKey: string
  ): Promise<Plan | null> {
    this.logRequest(req, `getActivePlanByKey`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpSubscriptionService.getActivePlanByKey(
      loggedUser,
      planKey as PlanKeys
    );
  }
}
