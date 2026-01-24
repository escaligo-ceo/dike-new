import { AppLogger, DikeConfigService } from "@dike/common";
import {
  ApiGatewayService,
  AuditService,
  BaseAdminController,
  BaseAdminService,
  UserFactory,
} from "@dike/communication";
import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HttpAuthService } from "../communication/http.auth.service";

@Controller("admin")
@ApiTags("admin")
export class AdminController extends BaseAdminController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
    protected readonly auditService: AuditService,
    protected readonly apiGatewayService: ApiGatewayService,
    protected readonly adminService: BaseAdminService,
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
