import {
  Analytics,
  AppLogger,
  AuthorizationBearer,
  CurrentUser,
  DikeConfigService,
  FullAccessTokenDto,
  ICreateUserResponse,
  ILoginResult,
  KeycloakUserDto,
  LoginUserDto,
  OriginDto,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import {
  Audit,
  AuditAction,
  AuditCategory,
  BaseController,
  JwtAuthGuard,
  KeycloakService,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AuthService } from "./auth.service";

/**
 * Alcune route di questo controller sono accessibili senza autenticazione (es. login, register)
 * mentre altre richiedono l'uso di JwtAuthGuard (es. logout).
 * Per questo motivo, l'uso di @UseGuards(JwtAuthGuard) viene applicato a livello di singolo metodo.
 */
@Controller("auth")
@ApiTags("auth")
export class AuthController extends BaseController {
  constructor(
    private readonly authService: AuthService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
    private readonly keycloakService: KeycloakService,
  ) {
    super(new AppLogger(AuthController.name), configService, userFactory);
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @Audit(AuditCategory.USER, AuditAction.LOGOUT)
  async logout(
    @CurrentUser() loggedUser: LoggedUser,
  ): Promise<{ success: boolean }> {
    this.logger.log("Logout attempt");
    return this.authService.logout(loggedUser);
  }

  @Post("register")
  @Version("1")
  @Audit(AuditCategory.USER, AuditAction.REGISTER)
  async register(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @Body() keycloakUserDto: KeycloakUserDto,
    @Req() req,
  ): Promise<ICreateUserResponse> {
    this.logRequest(
      req,
      `Register attempt with user: ${JSON.stringify(keycloakUserDto)}`,
    );
    const originDto: OriginDto = {
      originIp,
      originUserAgent,
      authorization: "",
    };
    return this.authService.register(originDto, keycloakUserDto);
  }

  @Post("login")
  @Version("1")
  @Audit(AuditCategory.USER, AuditAction.LOGIN)
  async login(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Body() payload: LoginUserDto,
    @Req() req,
    @Res() res: Response,
  ) {
    const loggedUser = this.userFactory.fromToken(
      undefined,
      originIp,
      originUserAgent,
      authorization,
    );

    const loginResult = await this.authService.loginUser(loggedUser, payload);

    // Qui restano solo le logiche HTTP
    const { access_token, refresh_token, redirectUrl } = loginResult;

    // imposta cookie, SameSite, secure
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // risposta JSON o redirect
    const wantsJson = (req.headers?.accept || "").includes("application/json");
    if (wantsJson) {
      res.status(HttpStatus.OK).json(loginResult);
    } else if (redirectUrl !== undefined) {
      res.redirect(redirectUrl);
    } else {
      throw new BadRequestException("No redirect URL provided");
    }
  }

  @Post("verify-email")
  @Version("1")
  @Audit(AuditCategory.USER, AuditAction.ADMIN_LOGIN)
  async checkEmailVerification(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authentication: string,
    @Body() body: { to: string },
    @Req() req,
  ): Promise<{ verified: boolean; to: string }> {
    this.logRequest(req, `Check email verification attempt for: ${body.to}`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authentication,
    );
    try {
      const verified = await this.authService.checkEmailVerification(
        loggedUser,
        body.to,
      );
      return {
        verified,
        to: body.to,
      };
    } catch (error) {
      this.logger.error("Error checking email verification:", error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("request-password-reset")
  @Version("1")
  @Audit(AuditCategory.USER, AuditAction.REQUEST_PASSWORD_RESET)
  async requestPasswordReset(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() body: { email: string },
    @Req() req,
  ): Promise<{ success: boolean; message: string; resetLink: string }> {
    this.logRequest(req, `Request password reset attempt for: ${body.email}`);
    try {
      const resetLink = await this.authService.generatePasswordResetLink(
        loggedUser,
        body.email,
      );
      return {
        success: true,
        message: "Link per il reset della password generato con successo",
        resetLink,
      };
    } catch (error) {
      this.logger.error("Error requesting password reset:", error);
      throw error;
    }
  }

  @Get("verify-email")
  @Version("1")
  @Audit(AuditCategory.USER, AuditAction.VERIFY_EMAIL)
  async verifyEmail(
    @CurrentUser() loggedUser: LoggedUser,
    @Query("email") email: string,
    @Query("token") queryToken: string,
    @Req() req,
  ): Promise<boolean> {
    this.logRequest(req, `Verify email attempt for: ${email}`);
    const isValid = await this.authService.validateEmailVerificationToken(
      loggedUser,
      email,
      queryToken,
    );
    if (!isValid) {
      // this.logger.error(
      //   `Invalid email verification token for ${email}: codice scaduto o non valido`
      // );
      throw new BadRequestException(
        `Invalid email verification token for ${email}: codice scaduto o non valido`,
      );
    }
    return isValid;
  }

  @UseGuards(JwtAuthGuard)
  @Post("refresh-token")
  @Version("1")
  @Analytics()
  async refreshToken(
    @CurrentUser() loggedUser: LoggedUser,
    @Body("userId") userId: string,
    @Req() req,
  ): Promise<ILoginResult> {
    this.logRequest(req, `Refresh token attempt for userId: ${userId}`);
    return this.authService.refreshToken(loggedUser);
  }

  @Post("internal/exchange-token")
  @Version("1")
  @Analytics()
  async exchangeToken(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Body() body: { userId: string; keycloakToken: string },
    @Req() req,
  ): Promise<{ token: string }> {
    this.logRequest(req, `exchangeToken`);
    const originDto: OriginDto = { originIp, originUserAgent };
    return this.authService.internaleExchangeToken(originDto, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post("verify-2fa")
  @Version("1")
  @Audit(AuditCategory.USER, AuditAction.VERIFY_2FA)
  @Analytics()
  async verifyTwoFactorAuth(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() body: { twoFactorCode: string },
    @Req() req,
    // ): Promise<ILoginResult> {
    //   this.logRequest(req, `verifyTwoFactorAuth`);
    //   const loggedUser = this.userFactory.fromToken(
    //     req.decodedKeycloakToken,
    //     originIp,
    //     originUserAgent,
    //     authorization
    //   );
    //   return this.authService.verifyTwoFactorAuth(loggedUser, body);
  ): Promise<void> {
    this.logRequest(req, `verifyTwoFactorAuth`);
    this.logger.error("verifyTwoFactorAuth not implemented yet");
    throw new Error("verifyTwoFactorAuth not implemented yet");
  }

  @UseGuards(JwtAuthGuard) // FIXME: valutare se serve il tipo di guard è quello corretto
  @Post("full-access-token")
  @Version("1")
  @Analytics()
  async generateFullAccessToken(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() payload: FullAccessTokenDto,
    @Req() req,
  ): Promise<string> {
    this.logRequest(req, `generateFullAccessToken`);
    return this.authService.generateFullAccessToken(loggedUser, payload);
  }
}
