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
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOperation, ApiParam } from "@nestjs/swagger";
import { WatchedPerson } from "../entities/watched-person.entity";
import { WatchedPersonService } from "./watched-person.service";

@UseGuards(JwtAuthGuard)
@Controller("watched-persons")
export class WatchedPersonController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    private readonly service: WatchedPersonService,
    protected readonly userFactory: UserFactory,
  ) {
    super(
      new AppLogger(WatchedPersonController.name),
      configService,
      userFactory,
    );
  }

  @Get()
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Get all watched persons" })
  async findAll(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ): Promise<WatchedPerson[]> {
    this.logRequest(req, `findAll`);
    return this.service.findAll(loggedUser);
  }

  @Get(":id")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Get watched person by ID" })
  @ApiParam({ name: "id", required: true, type: String })
  async findOne(
    @Param("id") id: string,
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ): Promise<WatchedPerson | null> {
    this.logRequest(req, `findOne called with id: ${id}`);
    return this.service.findOne(loggedUser, id);
  }

  @Post()
  @Version("1")
  @Audit(AuditCategory.WATCHED_PERSON, AuditAction.CREATE)
  @ApiOperation({ summary: "Create a new watched person" })
  async create(
    @Body() body: Partial<WatchedPerson>,
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ): Promise<WatchedPerson> {
    this.logRequest(req, `create`);
    return this.service.create(loggedUser, body);
  }

  @Put(":id")
  @Version("1")
  @Analytics()
  @Audit(AuditCategory.WATCHED_PERSON, AuditAction.UPDATE)
  @ApiOperation({ summary: "Update watched person by ID" })
  @ApiParam({ name: "id", required: true, type: String })
  async update(
    @Param("id") id: string,
    @Body() body: Partial<WatchedPerson>,
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ) {
    this.logRequest(req, `update called with id: ${id}`);
    return this.service.update(loggedUser, id, body);
  }

  @Delete(":id")
  @Version("1")
  @Analytics()
  @Audit(AuditCategory.WATCHED_PERSON, AuditAction.DELETE)
  @ApiOperation({ summary: "Delete watched person by ID" })
  @ApiParam({ name: "id", required: true, type: String })
  async remove(
    @Param("id") id: string,
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ) {
    this.logRequest(req, `remove called with id: ${id}`);
    return this.service.remove(loggedUser, id);
  }
}
