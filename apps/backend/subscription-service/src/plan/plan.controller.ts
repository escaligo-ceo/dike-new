import {
  Analytics,
  AppLogger,
  CurrentUser,
  DikeConfigService,
  Plan,
  PlanKeys,
} from "@dike/common";
import {
  AuditService,
  BaseController,
  JwtAuthGuard,
  LoggedUser,
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
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { PlanService } from "./plan.service";

@UseGuards(JwtAuthGuard)
@Controller("plans")
@ApiTags("plans")
export class PlanController extends BaseController {
  constructor(
    private readonly planService: PlanService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly auditService: AuditService,
    protected readonly userFactory: UserFactory,
  ) {
    super(new AppLogger(PlanController.name), configService, userFactory);
  }

  @Get()
  @Version("1")
  @Analytics()
  @ApiOperation({
    summary: "Get all active plans",
  })
  async getPlans(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ): Promise<PlanDto[]> {
    this.logRequest(req, "getPlans");
    const plans: PlanDto[] = await this.planService.getActivePlans(loggedUser);

    return plans;
  }

  @Get(":planKey")
  @Version("1")
  @Analytics()
  @ApiOperation({
    summary: "Get active plan by key",
  })
  @ApiParam({
    name: "planKey",
    description: "Plan key",
  })
  async getActivePlanByKey(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
    @Param("planKey") planKey: string,
  ): Promise<Plan | null> {
    this.logRequest(req, `getActivePlanByKey`);
    return this.planService.getActivePlanByKey(loggedUser, planKey as PlanKeys);
  }
}
