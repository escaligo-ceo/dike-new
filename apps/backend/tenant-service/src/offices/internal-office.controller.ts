import {
  AppLogger,
  CurrentUser,
  DikeConfigService,
  Office,
} from "@dike/common";
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
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OfficeService } from "./office.service";

@UseGuards(JwtAuthGuard)
@Controller("offices")
@ApiTags("internal/offices")
export class InternalOfficeController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
    @InjectRepository(Office)
    protected readonly officeRepository: Repository<Office>,
    protected readonly officeService: OfficeService,
  ) {
    super(
      new AppLogger(InternalOfficeController.name),
      configService,
      userFactory,
    );
  }

  @Post()
  @Version("1")
  @Audit(AuditCategory.OFFICE, AuditAction.CREATE)
  @ApiOperation({ summary: "Create a new office" })
  async createOffice(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
    @Body() body: Partial<Office>,
  ) {
    this.logRequest(req, "createOffice");
    return this.officeService.createOffice(loggedUser, body);
  }
}
