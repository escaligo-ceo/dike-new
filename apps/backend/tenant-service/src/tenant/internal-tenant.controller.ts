import {
  AppLogger,
  CurrentUser,
  DikeConfigService,
  Tenant,
} from "@dike/common";
import {
  Audit,
  AuditAction,
  AuditCategory,
  AuditService,
  BaseController,
  JwtAuthGuard,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { TeamService } from "../team/team.service";
import { OfficeService } from "./office.service";
import { TenantService } from "./tenant.service";

@UseGuards(JwtAuthGuard)
@Controller("internal/tenants")
@ApiTags("internal/tenants")
export class InternalTenantController extends BaseController {
  constructor(
    private readonly tenantService: TenantService,
    private readonly teamService: TeamService,
    private readonly officeService: OfficeService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly auditService: AuditService,
    protected readonly userFactory: UserFactory,
  ) {
    super(
      new AppLogger(InternalTenantController.name),
      configService,
      userFactory,
    );
  }

  @Post("find-or-create")
  @Version("1")
  @Audit(AuditCategory.TENANT, AuditAction.CREATE)
  @ApiOperation({ summary: "Find or create tenant for owner" })
  async findOrCreateForOwner(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() tenantData: Partial<Tenant>,
    @Req() req,
  ): Promise<[Tenant, boolean]> {
    this.logRequest(req, "findOrCreateForOwner");
    return this.tenantService.findOrCreate(loggedUser, tenantData);
  }
}
