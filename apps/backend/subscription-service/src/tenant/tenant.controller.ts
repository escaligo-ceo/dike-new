import {
  AppLogger,
  CurrentUser,
  DikeConfigService,
  Office,
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
@Controller("tenants")
@ApiTags("tenants")
export class TenantController extends BaseController {
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
    super(new AppLogger(TenantController.name), configService, userFactory);
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

  @Post(":tenantId/offices")
  @Version("1")
  @Audit(AuditCategory.OFFICE, AuditAction.CREATE)
  @ApiOperation({ summary: "Crea un office per un tenant" })
  @ApiParam({ name: "tenantId", description: "ID del tenant" })
  async createOfficeForTenant(
    @CurrentUser() loggedUser: LoggedUser,
    @Param("tenantId") tenantId: string,
    @Body() body: any,
    @Req() req,
  ): Promise<Office> {
    this.logRequest(req, "createOfficeForTenant");
    return this.tenantService.createOfficeForTenant(loggedUser, tenantId, body);
  }
}
