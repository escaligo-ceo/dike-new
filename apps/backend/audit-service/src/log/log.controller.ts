import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  inspect,
  OriginDto,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import {
  BaseController,
  LogDto,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import { Body, Controller, Post, Req, Version } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { LogService } from "./log.service";

@Controller("log")
@ApiTags("log")
export class LogController extends BaseController {
  constructor(
    private readonly auditService: LogService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory
  ) {
    super(new AppLogger(LogController.name), configService, userFactory);
  }

  @Post()
  @Version("1")
  @ApiOperation({ summary: "Registrazione audit" })
  async write(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @Body() body: LogDto,
    @Req() req,
    @AuthorizationBearer() authorization?: string
  ): Promise<void> {
    this.logRequest(req, `write: ${inspect(body)}`);
    let loggedUser: LoggedUser;
    let originDto: OriginDto;
    if (req.user === undefined) {
      this.logger.warn(
        `Attempt to write audit log without authenticated user from IP: ${originIp}`
      );
    }

    if (authorization === undefined || req.user === undefined) {
      originDto = { originIp: originIp, originUserAgent: originUserAgent };
    } else {
      loggedUser = this.userFactory.fromToken(
        req.decodedKeycloakToken,
        originIp,
        originUserAgent,
        authorization
      );
      originDto = loggedUser.token.originDto;
    }

    /**
     * Non bloccare la richiesta principale in caso di errore di logging e non uso await per non ritardare la risposta
     * e permettere che il sistema possa scalare meglio
     */
    this.auditService
      .writeLog(originDto, body)
      .catch((err) => this.logger.error(`Audit log failed: ${inspect(err)}`));

    return;
  }
}
