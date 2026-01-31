import {
  Analytics,
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  inspect,
  OriginIp,
  OriginUserAgent,
  Token,
  EmailVerificationToken,
} from "@dike/common";
import {
  Audit,
  AuditAction,
  AuditCategory,
  BaseController,
  KeycloakService,
  UserFactory,
} from "@dike/communication";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
  Req,
  Version,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@ApiTags("tokens")
@Controller("tokens")
export class TokensController extends BaseController {
  constructor(
    @InjectRepository(EmailVerificationToken)
    private readonly tokenRepository: Repository<EmailVerificationToken>,
    private readonly keycloakService: KeycloakService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
  ) {
    super(new AppLogger(TokensController.name), configService, userFactory);
  }

  // POST /tokens/email
  @Post("email")
  @Version("1")
  @Audit(AuditCategory.TOKEN, AuditAction.REQUEST_PASSWORD_RESET)
  @ApiOperation({ summary: "Crea un nuovo token di verifica email" })
  async createToken(
    @Body()
    body: {
      email: string;
      userId: string;
      token: string;
      expiresAt: Date;
      ip?: string;
      userAgent?: string;
    },
    @Req() req,
  ) {
    this.logRequest(req, `createToken called for email: ${body.email}`);
    try {
      const entity = this.tokenRepository.create({
        email: body.email,
        userId: body.userId,
        token: body.token,
        expiresAt: body.expiresAt,
        ip: body.ip,
        userAgent: body.userAgent,
      });
      const saved = await this.tokenRepository.save(entity);
      return { id: saved.id };
    } catch (err) {
      throw new HttpException(
        "Unable to save token",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GET /tokens/email?email=...
  @Get("email")
  @Version("1")
  @Analytics()
  @ApiOperation({
    summary: "Recupera il token di verifica email più recente per una mail",
  })
  @ApiQuery({
    name: "email",
    type: "string",
    required: true,
    example: "user@example.com",
  })
  async getTokenByEmail(@Query("email") email: string, @Req() req: Request) {
    this.logRequest(req, `getTokenByEmail called for email: ${email}`);
    if (!email) {
      throw new BadRequestException("Email is required");
    }
    const token = await this.tokenRepository.findOne({
      where: { email },
      order: { createdAt: "DESC" },
    });
    if (!token) {
      throw new NotFoundException("Token not found");
    }
    return token;
  }

  @Get("verify-email")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Verifica il token di verifica email" })
  @ApiQuery({
    name: "email",
    type: "string",
    required: true,
    example: "user@example.com",
  })
  @ApiQuery({
    name: "token",
    type: "string",
    required: true,
    example: "token-di-verifica",
  })
  async verifyEmail(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Query("email") email: string,
    @Query("token") token: string,
    @Req() req,
  ): Promise<{ valid: boolean }> {
    this.logRequest(req, `verifyEmail called for email: ${email}`);
    if (!email || !token || email === "" || token === "") {
      throw new BadRequestException("Email and token are required");
    }
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization,
    );
    const tokenDto: Token = loggedUser.getToken();
    const tokenEntity = await this.tokenRepository.findOne({
      where: { email, token, used: false },
    });
    if (!tokenEntity) {
      throw new BadRequestException("Token not found");
    }
    this.logger.debug(`Verifying email: ${email} with token: ${token}`);
    const { token: storedToken } = tokenEntity || {};
    const isValid = storedToken === token;
    if (isValid) {
      const userInfo = await this.keycloakService.getUserInfoByEmail(
        tokenDto,
        email,
      );
      if (!userInfo) {
        throw new BadRequestException(
          `Keycloak user (email = ${email}) not found`,
        );
      }
      this.logger.debug(
        `Email verification successful for user(${email}) -> userInfo: ${inspect(userInfo)}`,
      );
      userInfo.emailVerified = true;
      const { id, ...data } = userInfo;
      data.emailVerified = isValid;
      this.logger.debug(
        `Email verification successful for user(${email}) -> BEFORE setUserInfo: ${inspect(data)}`,
      );
      await this.keycloakService.setUserInfo(tokenDto, id, {
        ...data,
        emailVerified: isValid,
      });
      this.logger.debug(
        `Email verification successful for user(${email}) -> AFTER setUserInfo: ${inspect({ ...data, emailVerified: isValid })}`,
      );
      tokenEntity.used = isValid;
      this.logger.debug(
        `Email verification successful for user(${email}) -> BEFORE token saved as used: ${inspect(tokenEntity)}`,
      );
      await this.tokenRepository.save(tokenEntity);
      this.logger.debug(
        `Email verification successful for user(${email}) -> AFTER token saved as used: ${inspect(tokenEntity)}`,
      );
    }
    return { valid: isValid };
  }
}
