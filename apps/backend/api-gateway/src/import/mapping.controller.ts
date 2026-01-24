import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  ImportType,
  Mapping,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import { BaseController, JwtAuthGuard, UserFactory } from "@dike/communication";
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { HttpImportService } from "../communication/http.import.service";

@UseGuards(JwtAuthGuard)
@Controller("mappings")
export class MappingController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
    private readonly httpImportService: HttpImportService
  ) {
    super(new AppLogger(MappingController.name), configService, userFactory);
  }

  @Post("find-or-create")
  @Version("1")
  @ApiOperation({ summary: "Find or create a mapping based on headers hash" })
  async findOrCreateMapping(
    @Body()
    body: {
      tenantId: string;
      sourceType: ImportType;
      headers: string[];
      headerNormalized: string[];
      headerHash: string;
      headerHashAlgorithm: string;
    },
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authentication: string,
    @Req() req
  ) {
    this.logRequest(req, `findOrCreateMapping with hash: ${body.headerHash}`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authentication,
    );

    return this.httpImportService.findOrCreateMapping(
      loggedUser,
      body.sourceType,
      body.headers,
      body.headerNormalized,
      body.headerHash,
      body.headerHashAlgorithm
    );
  }

  @Put(":headerHash")
  @Version("1")
  @ApiOperation({ summary: "Update a mapping based on headers hash" })
  async updateMapping(
    @Body() mappingData: Partial<Mapping>,
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Param("headerHash") headerHash: string,
    @Req() req
  ) {
    this.logRequest(req, `updateMapping with hash: ${headerHash}`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    return this.httpImportService.updateMapping(
      loggedUser,
      headerHash,
      mappingData
    );
  }

  @Get(":headerHash")
  @Version("1")
  @ApiOperation({ summary: "Get a mapping based on headers hash" })
  async findMappingsByHash(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Param("headerHash") headerHash: string,
    @Req() req
  ): Promise<Mapping[]> {
    this.logRequest(req, `findMappingsByHash with hash: ${headerHash}`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    return this.httpImportService.findAllMappingsByHash(loggedUser, headerHash);
  }

  @Patch(":headerHash/rules")
  @Version("1")
  @ApiOperation({ summary: "Update mapping rules by headers hash" })
  async updateMappingRules(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Body() mappingData: Partial<Mapping>,
    @Param("headerHash") headerHash: string,
    @Req() req
  ): Promise<Mapping> {
    this.logRequest(req, `updateMappingRules`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpImportService.updateMappingRules(
      loggedUser,
      headerHash,
      mappingData
    );
  }

  @Get(":headerHash/rules")
  @Version("1")
  @ApiOperation({ summary: "Get mapping rules by headers hash" })
  async getMappingRulesByHash(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Param("headerHash") headerHash: string,
    @Req() req
  ): Promise<Record<string, any>> {
    this.logRequest(req, `getMappingRulesByHash with hash: ${headerHash}`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    return this.httpImportService.getMappingRulesByHash(loggedUser, headerHash);
  }
}
