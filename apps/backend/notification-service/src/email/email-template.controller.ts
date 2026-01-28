import { Analytics, AppLogger, CurrentUser, DikeConfigService } from "@dike/common";
import {
  Audit,
  AuditAction,
  AuditCategory,
  BaseController,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Version,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ResourceType } from "../entities/resource.entity";
import { TemplateLoaderService } from "../template-loader/template-loader.service";
import { EmailChannel } from "./email.service";

@ApiTags("email-templates")
@Controller("templates")
export class EmailTemplateController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    private readonly emailService: EmailChannel,
    private readonly templateLoader: TemplateLoaderService,
    protected readonly userFactory: UserFactory,
  ) {
    super(
      new AppLogger(EmailTemplateController.name),
      configService,
      userFactory,
    );
  }

  @Get()
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Lista tutti i template disponibili" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Lista dei template disponibili",
  })
  async getAvailableTemplates(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ): Promise<string[]> {
    this.logRequest(req, `getAvailableTemplates`);
    return this.emailService.getAvailableTemplates(loggedUser);
  }

  @Get(":templateName/files")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Lista i file di un template specifico" })
  @ApiParam({
    name: "templateName",
    type: "string",
    description: "Nome del template",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Lista dei file del template",
  })
  async getTemplateFiles(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
    @Param("templateName") templateName: string,
  ): Promise<string[]> {
    this.logRequest(req, "getTemplateFiles");
    return this.emailService.getTemplateFiles(loggedUser, templateName);
  }

  @Get(":templateName")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Carica un template specifico" })
  @ApiParam({
    name: "templateName",
    type: "string",
    description: "Nome del template",
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Contenuto del template" })
  async loadTemplate(
    @Param("templateName") templateName: string,
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
    @Query("extension") extension?: ResourceType,
  ) {
    this.logRequest(req, `loadTemplate`);
    const template = await this.templateLoader.loadTenantTemplate(loggedUser, {
      templateName,
      extension,
    });

    return {
      name: template.name,
      extensions: template.getAllExtensions(),
      files: template.files.map((file) => ({
        extension: file.extension,
        content:
          file.content.substring(0, 500) +
          (file.content.length > 500 ? "..." : ""), // Limita per preview
      })),
    };
  }

  @Post(":templateName/test")
  @Version("1")
  @Audit(AuditCategory.EMAIL_TEMPLATE, AuditAction.TEST_TEMPLATE)
  @ApiOperation({ summary: "Testa un template inviando una email di prova" })
  @ApiParam({
    name: "templateName",
    type: "string",
    description: "Nome del template",
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Email di test inviata" })
  async testTemplate(
    @Param("templateName") templateName: string,
    @Body()
    body: {
      to: string;
      variables?: Record<string, any>;
    },
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ) {
    this.logRequest(req, `testTemplate`);
    await this.emailService.sendEmailWithTenantTemplate(
      loggedUser,
      templateName,
      {
        to: body.to,
        variables: body.variables,
      },
    );

    return {
      message: `Email di test inviata usando template '${templateName}' a ${body.to}`,
      templateName,
      recipient: body.to,
      variables: body.variables,
    };
  }

  @Post("cache/clear")
  @Version("1")
  @Audit(AuditCategory.EMAIL_TEMPLATE, AuditAction.CLEAR_CACHE)
  @ApiOperation({ summary: "Pulisce la cache dei template" })
  @ApiResponse({ status: HttpStatus.OK, description: "Cache pulita" })
  async clearCache(@CurrentUser() loggedUser: LoggedUser, @Req() req) {
    this.logRequest(req, `clearCache`);
    this.emailService.clearTemplateCache();
    return { message: "Cache dei template pulita" };
  }
}
