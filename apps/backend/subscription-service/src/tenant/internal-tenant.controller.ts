import {
  AppLogger,
  CurrentUser,
  DikeConfigService,
  PlanKeys,
  Subscription,
} from "@dike/common";
import {
  ApiGatewayService,
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
  Param,
  Post,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PlanService } from "../plan/plan.service";
import { TenantService } from "./tenant.service";

@UseGuards(JwtAuthGuard)
@Controller("internal/tenants")
@ApiTags("internal/tenants")
@ApiTags("tenants")
export class InternalTenantController extends BaseController {
  constructor(
    private readonly apigatewayService: ApiGatewayService,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly planService: PlanService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    private readonly tenantService: TenantService,
    protected readonly userFactory: UserFactory,
  ) {
    super(
      new AppLogger(InternalTenantController.name),
      configService,
      userFactory,
    );
  }

  @Post(":tenantId/subscriptions")
  @Version("1")
  @Audit(AuditCategory.TENANT, AuditAction.SUBSCRIBE_PLAN)
  @ApiOperation({ summary: "Abbonare un piano a un tenant" })
  @ApiParam({ name: "tenantId", description: "ID del tenant" })
  async subscribePlanOnTenant(
    @CurrentUser() loggedUser: LoggedUser,
    @Param("tenantId") tenantId: string,
    @Req() req,
    @Body() { planKey }: { planKey: string },
  ): Promise<Subscription> {
    this.logRequest(req, "subscribePlanOnTenant");
    return this.tenantService.subscribePlanOnTenant(
      loggedUser,
      tenantId,
      planKey as PlanKeys,
    );
  }
}
