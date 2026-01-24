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
import { ApiOperation } from "@nestjs/swagger";
import { HttpImportService } from "../communication/http.import.service";

@UseGuards(JwtAuthGuard)
@Controller("contacts")
export class ContactController extends BaseController {
  constructor(
    protected logger: AppLogger,
    protected configService: DikeConfigService,
    protected userFactory: UserFactory,
    private readonly httpImportService: HttpImportService
  ) {
    super(new AppLogger(ContactController.name), configService, userFactory);
  }

  @ApiOperation({ summary: "Import contacts (multipart: file, mapping, type)" })
  @Post("import")
  @Version("1")
  @UseInterceptors(
    FileInterceptor("file", { limits: { fileSize: 10 * 1024 * 1024 } }) // limit to 10MB
  )
  async importContactsRaw(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @UploadedFile() file: any,
    @Body("headerHash") headerHash: string,
    @Body("type") type: ImportType = ImportType.CONTACT,
    @Req() req
  ): Promise<IBulkResponse<CreateContactFromImportDto>> {
    this.logRequest(req, `importContactsRaw`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    this.logger.debug(
      `API Gateway importing - file: ${file ? "present" : "missing"}, headerHash: ${headerHash}, type: ${type}`
    );

    return this.httpImportService.importsContacts(
      loggedUser,
      file,
      headerHash,
      type
    );
  }
}
