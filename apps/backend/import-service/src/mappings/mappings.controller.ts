import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  Mapping,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import {
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
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { MappingsService } from "./mappings.service";

@ApiTags("mappings")
@Controller("mappings")
@UseGuards(JwtAuthGuard)
export class MappingsController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    private readonly mappingsService: MappingsService,
    protected readonly userFactory: UserFactory
  ) {
    super(new AppLogger(MappingsController.name), configService, userFactory);
  }

  @Post()
  @Version("1")
  @ApiOperation({ summary: "Create default mappings" })
  async createMappings(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Body() data: Partial<Mapping>,
    @Req() req
  ) {
    this.logRequest(req, "createMappings");
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.mappingsService.createDefaultMapping(loggedUser, data);
  }

  @Post("find-or-create")
  @Version("1")
  @ApiOperation({ summary: "Find or create mappings based on headers hash" })
  async findOrCreateMapping(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Body()
    {
      // sourceType,
      headers,
      headerNormalized,
      headerHash,
      headerHashAlgorithm,
    }: {
      // sourceType: ImportType;
      headers: string[];
      headerNormalized: string[];
      headerHash: string;
      headerHashAlgorithm: string;
    },
    @Req() req
  ): Promise<[Mapping, boolean]> {
    this.logRequest(req, "findOrCreateMappings");
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.mappingsService.findOrCreateMapping(loggedUser, {
      // sourceType,
      headers,
      headerNormalized,
      headerHash,
      headerHashAlgorithm,
    });
  }

  @Get(":hash")
  @Version("1")
  @ApiOperation({ summary: "Get all mappings by headers hash" })
  @ApiParam({ name: "hash", description: "Hash of the headers to find" })
  async findAllByHash(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Param("hash") hash: string,
    @Req() req
  ): Promise<Mapping[]> {
    this.logRequest(req, "findAllByHash");
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.mappingsService.findAllByHash(loggedUser, hash);
  }

  @Put(":hash")
  @Version("1")
  @ApiOperation({ summary: "Update mapping by headers hash" })
  @ApiParam({ name: "hash", description: "Hash of the headers to update" })
  async updateMappingByHash(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Param("hash") hash: string,
    @Body()
    {
      headers,
      headerNormalized,
      headerHashAlgorithm,
      rules,
      name,
      description,
    }: {
      headers?: string[];
      headerNormalized?: string[];
      headerHashAlgorithm?: string;
      rules?: Record<string, string>;
      name?: string;
      description?: string;
    },
    @Req() req
  ) {
    this.logRequest(req, "updateMappingByHash");
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const mappingData: Partial<Mapping> = {
      headers,
      headerNormalized,
      headerHashAlgorithm,
      rules,
      name,
      description,
    };
    return this.mappingsService.updateMappingByHash(
      loggedUser,
      hash,
      mappingData
    );
  }

  @Delete(":hash")
  @Version("1")
  @ApiOperation({ summary: "Delete mapping by headers hash" })
  @ApiParam({ name: "hash", description: "Hash of the headers to delete" })
  async deleteMappingByHash(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Param("hash") hash: string,
    @Req() req
  ) {
    this.logRequest(req, "deleteMappingByHash");
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.mappingsService.deleteMappingByHash(loggedUser, hash);
  }

  @Patch(":hash/rules")
  @Version("1")
  @ApiOperation({ summary: "Update mapping rules by headers hash" })
  @ApiParam({
    name: "hash",
    description: "Hash of the headers to update rules for",
  })
  async updateMappingRules(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Param("hash") hash: string,
    @Body() mappingData: Partial<Mapping>,
    @Req() req
  ) {
    this.logRequest(req, "updateMappingRules");
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.mappingsService.updateMappingRules(
      loggedUser,
      hash,
      mappingData
    );
  }

  @Post(":hash/validate")
  @Version("1")
  @ApiOperation({ summary: "Validate mapping by headers hash" })
  @ApiParam({ name: "hash", description: "Hash of the headers to validate" })
  async validateMapping(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Param("hash") hash: string,
    @Body() { sampleData }: { sampleData: Record<string, any>[] },
    @Req() req
  ) {
    this.logRequest(req, "validateMapping");
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.mappingsService.validateMapping(loggedUser, hash, sampleData);
  }

  @Get(":hash/rules")
  @Version("1")
  @ApiOperation({ summary: "Get mapping rules by headers hash" })
  @ApiParam({
    name: "hash",
    description: "Hash of the headers to get rules for",
  })
  async getMappingRulesByHash(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Param("hash") hash: string,
    @Req() req
  ): Promise<Record<string, any>> {
    this.logRequest(req, "getMappingRulesByHash");
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.mappingsService.getMappingRulesByHash(loggedUser, hash);
  }
}
