import {
  AppLogger,
  AuthorizationBearer,
  CreateContactFromImportDto,
  DikeConfigService,
  IBulkResponse,
  ImportType,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import { BaseController, JwtAuthGuard, UserFactory } from "@dike/communication";
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Version,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { ImportsService } from "./imports.service";

@ApiTags("imports")
@UseGuards(JwtAuthGuard)
@Controller("imports")
export class ImportsController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
    private readonly importsService: ImportsService
  ) {
    super(new AppLogger(ImportsController.name), configService, userFactory);
  }

  @Post("contacts")
  @Version("1")
  @ApiOperation({
    summary:
      "Upload contacts (JSON from gateway: file buffer + mapping + type)",
  })
  @ApiParam({
    name: "file",
    type: "file",
    description: "The file to be imported",
  })
  @ApiParam({
    name: "headerHash",
    type: "string",
    description: "The header hash for mapping",
  })
  @ApiParam({ name: "type", type: "string", description: "The import type" })
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    })
  )
  async importsContacts(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @UploadedFile() file: any,
    @Body("headerHash") headerHash: string,
    @Body("type") type: ImportType = ImportType.CONTACT,
    @Req() req
  ): Promise<IBulkResponse<CreateContactFromImportDto>> {
    this.logRequest(req, `importsContacts`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    if (!file) {
      throw new BadRequestException(
        "[ImportService] File is required for import"
      );
    } else {
      this.logger.debug(
        `[ImportService] File received for import: ${file.originalname} with size ${file.size} bytes`
      );
    }
    return this.importsService.importsContacts(
      loggedUser,
      file,
      headerHash,
      type
    );
  }
}
