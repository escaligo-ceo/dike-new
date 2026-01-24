import { AppLogger, DikeConfigService } from "@dike/common";
import {
  AdminAuthGuard,
  ApiGatewayService,
  AuditService,
  BaseAdminController,
  UserFactory,
} from "@dike/communication";
import { Controller, UseGuards, VERSION_NEUTRAL } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AdminService } from "./admin.service";

@ApiTags("admin")
@UseGuards(AdminAuthGuard)
@Controller({
  path: "admin",
  version: VERSION_NEUTRAL,
})
export class AdminController extends BaseAdminController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
    protected readonly auditService: AuditService,
    protected readonly apiGatewayService: ApiGatewayService,
    protected readonly adminService: AdminService
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
}
