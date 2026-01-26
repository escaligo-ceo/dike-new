import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  IPingResponse,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import { BaseController, UserFactory } from "@dike/communication";
import {
  Controller,
  Get,
  Header,
  Req,
  Version,
  VERSION_NEUTRAL,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { AppService } from "./app.service";

@Controller()
export class AppController extends BaseController {
  constructor(
    private readonly appService: AppService,
    protected readonly configService: DikeConfigService,
    protected readonly logger: AppLogger,
    protected readonly userFactory: UserFactory
  ) {
    super(new AppLogger(AppController.name), configService, userFactory);
  }

  @Get()
  @Version(VERSION_NEUTRAL)
  @ApiOperation({ summary: "ping" })
  @ApiOkResponse({
    description: "Il servizio è attivo",
  })
  @Header("Content-Type", "application/json")
  ping(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ): IPingResponse {
    this.logRequest(req, "ping");
    // originIp e originUserAgent disponibili per logging o auditing
    return this.appService.ping();
  }
}
