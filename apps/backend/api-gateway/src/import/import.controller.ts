import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
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
import { ApiOperation } from "@nestjs/swagger";
import { HttpImportService } from "../communication/http.import.service";

@UseGuards(JwtAuthGuard)
@Controller("imports")
export class ImportController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
    private readonly httpImportService: HttpImportService
  ) {
    super(new AppLogger(ImportController.name), configService, userFactory);
  }

  @ApiOperation({ summary: "Upload contacts for import" })
  @Post("contacts")
  @Version("1")
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
    // @Body() formData: FormData,
    @Req() req
  ) {
    this.logRequest(req, `importsContacts`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    if (!file) {
      throw new BadRequestException("File is required for import");
    } else {
      this.logger.log(
        `[ApiGateway] ImportController.importsContacts - file received with size: ${file.size} bytes`
      );
    }
    return this.httpImportService.importsContacts(
      loggedUser,
      file,
      headerHash,
      type
      // formData
    );
  }
}
