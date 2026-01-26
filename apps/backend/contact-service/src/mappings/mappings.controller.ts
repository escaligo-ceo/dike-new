import {
  Analytics,
  AppLogger,
  CurrentUser,
  DikeConfigService,
  ImportType,
} from "@dike/common";
import { Audit, AuditAction, AuditCategory, BaseController, LoggedUser, UserFactory } from "@dike/communication";
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Version,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { MappingsService } from "./mappings.service";

@ApiTags("mappings")
@Controller("mappings")
export class MappingsController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    private readonly mappingService: MappingsService,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
  ) {
    super(new AppLogger(MappingsController.name), configService, userFactory);
  }

  @Post("find-or-create")
  @Version("1")
  @Audit(AuditCategory.MAPPING, AuditAction.CREATE)
  @ApiOperation({ summary: "Find or create mapping by headers" })
  async findOrCreate(
    sourceType: ImportType,
    headers: string[],
    headerNormalized: string[],
    headerHash: string,
    headerHashAlgorithm: string,
    @Req() req,
    @CurrentUser() loggedUser: LoggedUser,
  ) {
    this.logRequest(req, `findOrCreate called with hash: ${headerHash}`);
    return this.mappingService.findOrCreate(
      loggedUser,
      sourceType,
      headers,
      headerNormalized,
      headerHash,
      headerHashAlgorithm,
    );
  }

  @Get(":headerHash")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Find mapping by header hash" })
  @ApiParam({ name: "headerHash", description: "Hash of the headers to find" })
  async findByHash(
    @Param("headerHash") headerHash: string,
    @CurrentUser() loggedUser: LoggedUser,
    @Req() request,
  ) {
    this.logRequest(request, `findByHash called with hash: ${headerHash}`);
    return this.mappingService.findByHash(loggedUser, headerHash);
  }

  @Put(":headerHash")
  @Version("1")
  @Audit(AuditCategory.MAPPING, AuditAction.UPDATE)
  @ApiOperation({ summary: "Update mapping by header hash" })
  @ApiParam({
    name: "headerHash",
    description: "Hash of the headers to update",
  })
  async updateMapping(
    @CurrentUser() loggedUser: LoggedUser,
    @Body()
    body: {
      headers: string[];
      headerNormalized: string[];
    },
    @Param("headerHash") headerHash: string,
    @Req() request,
  ) {
    this.logRequest(request, `updateMapping called with hash: ${headerHash}`);
    const { headers, headerNormalized } = body;
    return this.mappingService.updateMapping(
      loggedUser,
      headerHash,
      headers,
      headerNormalized,
    );
  }
}
