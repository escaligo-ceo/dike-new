import { AppLogger, DikeConfigService } from "@dike/common";
import { BaseController, JwtAuthGuard, UserFactory } from "@dike/communication";
import { Controller, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@UseGuards(JwtAuthGuard)
@Controller("office")
@ApiTags("office")
export class OfficeController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
  ) {
    super(new AppLogger(OfficeController.name), configService, userFactory);
  }
}
