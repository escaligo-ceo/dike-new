import {
  AccessResponse,
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  ILoginResult,
  IRegisterUserResult,
  KeycloakUserDto,
  LoginUserDto,
  OriginDto,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import { BaseController, JwtAuthGuard, UserFactory } from "@dike/communication";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { HttpAuthService } from "../communication/http.auth.service";
import { HttpProcessService } from "../communication/http.process.service";

@Controller("auth")
export class AuthController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
    private readonly httpProcessService: HttpProcessService,
    private readonly httpAuthService: HttpAuthService,
  ) {
    super(new AppLogger(AuthController.name), configService, userFactory);
  }

  @Post("register")
  @Version("1")
  @ApiOperation({ summary: "Registrazione utente" })
  @ApiOkResponse({ description: "Registrazione effettuato con successo" })
  async register(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @Body() keycloakUserDto: KeycloakUserDto,
    @Req() req
  ): Promise<IRegisterUserResult> {
    this.logRequest(
      req,
      `Register attempt for user: ${keycloakUserDto.email || keycloakUserDto.username}`
    );
    const originDto: OriginDto = { originIp, originUserAgent };
    return this.httpAuthService.register(originDto, keycloakUserDto);
  }

  @Post("login")
  @Version("1")
  async login(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @Body() payload: LoginUserDto,
    @Req() req
  ): Promise<AccessResponse> {
    if (!payload.email && !payload.username) {
      throw new Error("Either email or username must be provided for login");
    }
    this.logRequest(req, `Login attempt for user: ${payload.email || payload.username}`);
    const originDto: OriginDto = { originIp, originUserAgent };
    
    return this.httpProcessService.login(originDto, payload);
  }

  @Get("verify-email")
  @Version("1")
  async verifyEmail(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Query("token") verificationLink: string,
    @Query("email") email: string,
    @Req() req
  ): Promise<any> {
    this.logRequest(
      req,
      `Email verification process started for ${email} with token: ${verificationLink}`
    );
    const originDto: OriginDto = { originIp, originUserAgent };
    const isValid = await this.httpAuthService.verifyEmail(
      originDto,
      verificationLink,
      email
    );
    if (!isValid) {
      throw new BadRequestException("Invalid token");
    }
    return { message: "Email verified successfully" };
  }

  @UseGuards(JwtAuthGuard)
  @Post("refresh-token")
  @Version("1")
  async refreshToken(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authentication: string,
    @Body("userId") userId: string,
    @Req() req
  ): Promise<ILoginResult> {
    this.logRequest(req, `refreshToken`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authentication,
    );
    return this.httpAuthService.refreshToken(loggedUser, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  async logout(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ): Promise<any> {
    this.logRequest(req, "Logout attempt");
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpAuthService.logout(loggedUser);
  }

  @Post("internal/exchange-token")
  @Version("1")
  @ApiOperation({ summary: "Exchange Keycloak token for internal token" })
  @ApiResponse({ status: 200, description: "Token exchanged successfully." })
  async exchangeToken(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @Body("keycloakToken") keycloakToken: string,
    @Req() req
  ): Promise<{ token: string }> {
    this.logRequest(req, `exchangeToken`);
    const originDto: OriginDto = { originIp, originUserAgent };
    return this.httpAuthService.internalExchangeToken(originDto, keycloakToken);
  }
}
