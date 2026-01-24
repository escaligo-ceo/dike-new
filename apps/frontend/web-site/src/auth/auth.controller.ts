import {
  AccessResponse,
  AccessStep,
  AppLogger,
  AuthGuard,
  AuthorizationBearer,
  DikeConfigService,
  inspect,
  IRegisterResult,
  KeycloakUserDto,
  LoginUserDto,
  OriginDto,
  OriginIp,
  OriginUserAgent,
  Token,
} from "@dike/common";
import {
  ApiGatewayService,
  BaseController,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
  Render,
  Req,
  Res,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AuthService } from "./auth.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController extends BaseController {
  constructor(
    protected readonly configService: DikeConfigService,
    protected readonly logger: AppLogger,
    protected readonly userFactory: UserFactory,
    private readonly apiGatewayService: ApiGatewayService,
    private readonly authService: AuthService,
  ) {
    super(new AppLogger(AuthController.name), configService, userFactory);
  }

  @Post("register")
  @Version("1")
  async registerUser(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @Body() keycloakUserDto: KeycloakUserDto,
    @Res() res,
    @Req() req
  ) {
    this.logRequest(
      req,
      `registerUser called for email: ${keycloakUserDto.email}`
    );
    const originDto: OriginDto = { originIp, originUserAgent };
    const response: IRegisterResult = await this.apiGatewayService.registerUser(
      originDto,
      keycloakUserDto
    );
    if (!response || typeof response !== "object" || !("email" in response)) {
      this.logger.error(
        `Errore nella registrazione utente: risposta non valida dal backend: ${inspect(response)}`
      );
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .render("errors/internal-error", {
          message: "Errore durante la registrazione. Riprova più tardi.",
          error: response,
        });
    }
    const { success, status, message, id, email } = response;
    this.logger.debug(`User registered successfully: ${inspect(response)}`);
    // Redirect con email come query param
    return res.redirect(
      `/auth/verify-email-pending?email=${encodeURIComponent(email)}`
    );
  }

  @Post("login")
  async loginUser(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @Body() payload: LoginUserDto,
    @Req() req,
    @Res() res: Response,
  ): Promise<AccessResponse | void> {
    const userIdentifier = payload.email ?? payload.username ?? "";
    this.logRequest(req, `loginUser called for user: ${userIdentifier}`);

    const originDto: OriginDto = { originIp, originUserAgent };

    // 1️⃣ Chiamata al service
    const accessResponse: AccessResponse = await this.apiGatewayService.loginUser(originDto, payload);
    this.logger.debug(`Login result: ${inspect(accessResponse)}`);

    this.authService.handleAccessResponse(accessResponse);

    // 2️⃣ Config cookie
    const isProd = this.configService.env("NODE_ENV", "true") === "true";
    let sameSite = (this.configService.env("COOKIE_SAMESITE", "none") ?? (isProd ? "none" : "lax")).toLowerCase() as "lax" | "strict" | "none";
    const secure = (this.configService.env("COOKIE_SECURE", isProd ? "true" : "false") === "true");

    // Browsers rifiutano SameSite=None senza Secure
    if (sameSite === "none" && !secure) sameSite = "lax";

    let domain: string | undefined = this.configService.env("COOKIE_DOMAIN", "localhost");
    if (domain === "localhost") domain = undefined; // evita rejection cookie localhost
    const path = this.configService.env("COOKIE_PATH", "/");

    const cookieOptions = { httpOnly: true, sameSite, secure, domain, path };

    // // 3️⃣ Gestione caso email non verificata
    // if (accessResponse.stepStatus === AccessStep.EMAIL_VERIFICATION) {
    //   // Reindirizza alla pagina di verifica
    //   res.redirect("/auth/verify-email-required");
    //   return;
    // }

    const access_token = accessResponse.token?.value;

    // 4️⃣ Imposta cookie
    if (accessResponse.refreshToken) {
      res.cookie("refresh_token", accessResponse.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 giorni
      });
    }
    if (access_token) {
      res.cookie("access_token", access_token, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minuti
      });
      res.cookie("keycloak-token", access_token, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000, // 15 minuti
      });
    } else {
      this.logger.error("Login fallito: access token mancante nella risposta");
      throw new NotFoundException("Login fallito: access token mancante nella risposta");
    }

    // 5️⃣ Redirect finale
    let redirectUrl = typeof accessResponse.redirectUrl === "string"
      ? accessResponse.redirectUrl
      : "/dashboard";
    if (!redirectUrl.startsWith("/")) redirectUrl = `/${redirectUrl}`;
    res.redirect(redirectUrl);
  }

  @Get("verify-email-pending")
  @Render("auth/verify-email-pending")
  verifyEmailPending(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req,
    @Query("email") email: string
  ) {
    this.logRequest(req, 'verifyEmailPending');
    return {
      title: "Completare la verifica dell'email",
      email,
    };
  }

  @UseGuards(AuthGuard)
  @Get("verify-email-required")
  async getVerifyEmailRequired(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req,
    @Res() res
  ) {
    this.logRequest(req, 'getVerifyEmailRequired');
    const email = req.user.email;
    const csrfToken = req.csrfToken();

    res.render("auth/verify-email-required.njk", { email, csrfToken });
  }

  @UseGuards(AuthGuard)
  @Post("email-verification")
  @ApiOperation({
    summary: "Invia una nuova richiesta di verifica all'indirizzo email dell\'utente",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Nuovo link di verifica inviato",
  })
  async verificationToken(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req,
    @Res() res,
    @Query("email") email: string,
    @Query("token") token: string,
  ) {
    this.logRequest(req, 'verificationToken');
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    await this.apiGatewayService.sendVerificationMail(loggedUser, {
      to: email,
      link: token,
    });

    res.render("auth/verify-email-required.njk", {
      email,
      message:
        "Ti abbiamo inviato un nuovo link di verifica dell'indirizzo email.",
      csrfToken: req.csrfToken(),
    });
  }

  @Get("verify-email")
  @ApiOperation({
    summary: "Verifica email tramite token",
  })
  @ApiQuery({
    name: "email",
    type: "string",
    required: true,
  })
  @ApiQuery({
    name: "token",
    type: "string",
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Risultato verifica email",
  })
  @Render("auth/verify-email-result")
  async verifyEmail(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req,
    @Res() res,
    @Query("email") email: string,
    @Query("token") verificationToken: string
  ): Promise<any> {
    const tokenDto: Token = new Token(originIp, originUserAgent, authorization);
    this.logger.debug(`Email verification process started for ${email}`);

    const isVerified = await this.apiGatewayService.verifyEmailToken(tokenDto, {
      to: email,
      verificationLink: verificationToken,
    });
    // const isVerified = false;
    this.logger.debug(
      `Email verification token validation for ${email}: ${inspect(isVerified)}`
    );

    return {
      title: "Verifica email",
      email,
      token: verificationToken,
      result: {
        success: isVerified,
        message: isVerified
          ? "Email verificata con successo!"
          : "La verifica dell'email è fallita.",
      },
    };
  }

  @UseGuards(AuthGuard)
  @Post("logout")
  async logout(@Req() req, @Res() res) {
    const accessToken =
      req.cookies["refresh_token"] || req.cookies["access_token"];
    await this.apiGatewayService.logoutUser(accessToken);
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.clearCookie("keycloak-token");
    // Redirect to login after logout
    res.redirect("/login");
  }
}
