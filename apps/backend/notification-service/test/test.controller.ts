import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import { BaseController, UserFactory } from "@dike/communication";
import { Controller, Get, Req } from "@nestjs/common";
import { EmailChannel } from "../src/channels/email/email.service";

@Controller("test")
export class TestController extends BaseController {
  constructor(
    private readonly emailService: EmailChannel,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory
  ) {
    super(new AppLogger(TestController.name), configService, userFactory);
  }

  @Get("template-loader")
  async testTemplateLoader(
    @Req() req,
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() token: string
  ) {
    this.logRequest(
      req,
      `testTemplateLoader called with originIp: ${originIp}, originUserAgent: ${originUserAgent}`
    );
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      token
    );
    this.logger.log("🧪 Endpoint di test per TemplateLoader chiamato");

    try {
      await this.emailService.testTemplateLoader(loggedUser);
      this.logger.log("✅ Test TemplateLoader completato con successo");
      return {
        success: true,
        message: "TemplateLoader test completed successfully",
      };
    } catch (error) {
      this.logger.error("❌ Test TemplateLoader fallito:", error.message);
      return {
        success: false,
        message: "TemplateLoader test failed",
        error: error.message,
      };
    }
  }
}
