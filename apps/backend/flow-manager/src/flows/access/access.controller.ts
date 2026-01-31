import {
  AccessResponse,
  AccessStatus,
  AccessStep,
  AccessStepStatus,
  AppLogger,
  CurrentUser,
  DikeConfigService,
  inspect,
  LoginUserDto,
  VerificationDto,
} from "@dike/common";
import {
  Audit,
  AuditAction,
  AuditCategory,
  BaseController,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import { Body, Controller, Post, Req, Version } from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { HttpNotificationService } from "../../communication/http.notification.service";
import { AccessService } from "./access.service";

@Controller("auth")
export class AccessFlowController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
    private readonly accessService: AccessService,
    private readonly httpNotificationService: HttpNotificationService,
  ) {
    super(new AppLogger(AccessFlowController.name), configService, userFactory);
  }

  @Post("login")
  @Version("1")
  @Audit(AuditCategory.USER, AuditAction.LOGIN)
  @ApiOperation({ summary: "User login" })
  @ApiOkResponse({ description: "Login successful" })
  async login(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() loginUserDto: LoginUserDto,
    @Req() req,
  ): Promise<AccessResponse> {
    this.logRequest(req, `Login attempt for user: ${inspect(loginUserDto)}`);
    // const res = await this.httpAuthService.login(originDto, payload);
    const res = await this.accessService.start(
      loggedUser,
      loginUserDto,
    );
    this.logger.debug(`Login successful for user: ${inspect(loginUserDto)}`);
    return res;
  }

  @Post("resend-email")
  @Version("1")
  @Audit(AuditCategory.USER, AuditAction.SEND_EMAIL_VERIFICATION)
  @ApiOperation({ summary: "Resend email verification" })
  @ApiOkResponse({ description: "Email verification resent" })
  async resendEmailVerification(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() payload: VerificationDto,
    @Req() req,
  ): Promise<AccessResponse> {
    this.logRequest(
      req,
      `Resend email verification for user: ${inspect(payload)}`,
    );
    await this.httpNotificationService.sendEmailVerification(
      loggedUser,
      payload,
    );
    this.logger.debug(
      `Email verification resent for user: ${inspect(payload)}`,
    );
    return {
      status: AccessStatus.SUCCESS,
      step: AccessStep.EMAIL_VERIFICATION,
      stepStatus: AccessStepStatus.PENDING,
      message: "Verifica la tua emailEMAIL_VERIFICATION",
      token: {
        type: "LIMITED",
        value: loggedUser.token.accessToken,
      },
      refreshToken: loggedUser.token.refreshToken,
    };
  }

  // @Post("exchange-token")
  // @Version(VERSION_NEUTRAL)
  // @ApiOperation({ summary: "Exchanges an external token for a Dike JWT token" })
  // @ApiOkResponse({ description: "The exchanged JWT token" })
  // async exchangeToken(
  //   @OriginIp() originIp: string,
  //   @OriginUserAgent() originUserAgent: string,
  //   @AuthorizationBearer() authorization: string,
  //   @Body() body: KeycloakUserDto,
  //   @Req() req,
  // ): Promise<{ token: string }> {
  //   this.logRequest(
  //     req,
  //     `exchangeToken called for external userId: ${inspect(body)}`,
  //   );
  //   const loggedUser = this.userFactory.fromToken(
  //     undefined,
  //     originIp,
  //     originUserAgent,
  //     authorization,
  //   );
  //   return this.httpAuthService.internalExchangeToken(loggedUser);
  // }
}
