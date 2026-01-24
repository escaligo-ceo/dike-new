import { Analytics, AppLogger, CurrentUser, DikeConfigService } from "@dike/common";
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
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";

@Controller("pref")
@UseGuards(JwtAuthGuard)
@ApiTags("preferences")
export class PrefController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
  ) {
    super(new AppLogger(PrefController.name), configService, userFactory);
  }

  @Get()
  @Version("1")
  @Analytics()
  @ApiOperation({
    summary: "Get system preferences",
  })
  getSystemPreferences(@CurrentUser() loggedUser: LoggedUser, @Req() req) {
    this.logRequest(req, `getSystemPreferences`);
    const userId = loggedUser.id;
  }

  @Post()
  @Version("1")
  @Audit(AuditCategory.USER, AuditAction.SET_PREFERENCE_SYSTEM)
  @ApiOperation({
    summary: "Set system preferences",
  })
  setSystemPreferences(@CurrentUser() loggedUser: LoggedUser, @Req() req) {
    this.logRequest(req, `setSystemPreferences`);
    const userId = loggedUser.id;
    // Logic to set system preferences
  }

  @Get("tenants/:tenantId")
  @Version("1")
  @Analytics()
  @ApiOperation({
    summary: "Get tenant preferences",
  })
  @ApiParam({ name: "tenantId", type: "string", description: "ID del tenant" })
  getTenantPreferences(@CurrentUser() loggedUser: LoggedUser, @Req() req) {
    this.logRequest(req, `getTenantPreferences`);
    const userId = loggedUser.id;
    // Logic to get tenant preferences
  }

  @Post("tenants/:tenantId")
  @Version("1")
  @Audit(AuditCategory.TENANT, AuditAction.SET_PREFERENCE)
  @ApiOperation({
    summary: "Set tenant preferences",
  })
  @ApiParam({ name: "tenantId", type: "string", description: "ID del tenant" })
  setTenantPreferences(
    @CurrentUser() loggedUser: LoggedUser,
    @Param("tenantId") tenantId: string,
    @Req() req,
  ) {
    this.logRequest(req, `setTenantPreferences`);
    const userId = loggedUser.id;
    // Logic to set tenant preferences
  }

  @Get("user")
  @Version("1")
  @Analytics()
  @ApiOperation({
    summary: "Get user preferences",
  })
  getUserPreferences(@CurrentUser() loggedUser: LoggedUser, @Req() req) {
    this.logRequest(req, `getUserPreferences`);
    const userId = loggedUser.id;
    // Logic to get user preferences
  }

  @Post("user")
  @Version("1")
  @Audit(AuditCategory.USER, AuditAction.SET_PREFERENCE)
  @ApiOperation({
    summary: "Set user preferences",
  })
  setUserPreferences(@CurrentUser() loggedUser: LoggedUser, @Req() req) {
    this.logRequest(req, `setUserPreferences`);
    const userId = loggedUser.id;
    // Logic to set user preferences
  }

  @Get("user/tenants/:tenantId")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Get user tenant preferences" })
  @ApiParam({ name: "tenantId", type: "string", description: "ID del tenant" })
  getUserTenantPreferences(
    @CurrentUser() loggedUser: LoggedUser,
    @Param("tenantId") tenantId: string,
    @Req() req,
  ) {
    this.logRequest(req, `getUserTenantPreferences`);
    const userId = loggedUser.id;
    // Logic to get user tenant preferences
  }

  @Post("user/tenants/:tenantId")
  @Version("1")
  @Audit(AuditCategory.USER, AuditAction.SET_PREFERENCE)
  @ApiOperation({ summary: "Set user tenant preferences" })
  @ApiParam({ name: "tenantId", type: "string", description: "ID del tenant" })
  setUserTenantPreferences(
    @CurrentUser() loggedUser: LoggedUser,
    @Param("tenantId") tenantId: string,
    @Req() req,
  ) {
    this.logRequest(req, `setUserTenantPreferences`);
    const userId = loggedUser.id;
    // Logic to set user tenant preferences
  }
}
