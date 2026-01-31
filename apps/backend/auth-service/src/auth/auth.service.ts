import {
  AccessStatus,
  AppLogger,
  DikeJwtService,
  EnvNotFoundException,
  FullAccessTokenDto,
  ICreateUserResponse,
  ILoginResult,
  inspect,
  IRegisterUserResult,
  IVerificationResult,
  KeycloakUserDto,
  LoginStatus,
  LoginUserDto,
  OriginDto,
  RegistrationStatus,
  Token,
  TokenType,
  UserAlreadyExistsException,
  EmailVerificationToken,
  VerificationTokenService,
} from "@dike/common";
import {
  AuditService,
  DecodedKeycloakToken,
  IGetTokenResult,
  IKeycloakUser,
  IKeycloakUserInfo,
  ITokenResponse,
  IValidateUserResponse,
  KeycloakService,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AxiosResponse } from "axios";
import { firstValueFrom } from "rxjs";
import { Repository } from "typeorm";
import { HttpProcessService } from "../communication/http.process.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: AppLogger,
    private readonly verificationTokenService: VerificationTokenService,
    private readonly keycloakService: KeycloakService,
    @InjectRepository(EmailVerificationToken)
    private readonly tokenRepository: Repository<EmailVerificationToken>,
    private readonly auditService: AuditService,
    private readonly userFactory: UserFactory,
    private readonly httpProcessService: HttpProcessService,
    private readonly jwtService: DikeJwtService,
  ) {
    this.logger = new AppLogger(AuthService.name);

    if (!this.keycloakService.dikeClientExists) {
      this.keycloakService.createDikeClient();
    }
  }

  async validateUser(
    username: string,
    password: string,
  ): Promise<IValidateUserResponse> {
    let msg: string;

    const data = new URLSearchParams();
    data.append("client_id", this.keycloakService.clientId);
    data.append("client_secret", this.keycloakService.clientSecret);
    data.append("username", username);
    data.append("password", password);
    data.append("grant_type", "password");

    const response = (await firstValueFrom(
      this.httpService.post(`${this.keycloakService.baseUrl}/token`, data, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }),
    )) as AxiosResponse;

    this.logger.log(`User ${username} validated successfully`);

    return response.data as IValidateUserResponse;
  }

  async register(
    originDto: OriginDto,
    payload: KeycloakUserDto,
  ): Promise<IRegisterUserResult> {
    try {
      const { password, email, username } = payload;
      const response: ICreateUserResponse =
        await this.keycloakService.createUser(originDto, payload);
      this.logger.log(`User ${email}(${username}) registered successfully`);

      const { userId } = response;
      if (!userId) {
        throw new Error("User ID is not defined in the registration response");
      }

      // genero il token di verifica della mail
      const emailVerificationTokenResponse: IVerificationResult =
        this.verificationTokenService.generateEmailVerificationToken({
          userId,
          email: response.email,
          tokenType: TokenType.EMAIL_VERIFICATION,
        });
      const { verificationUrl, token, expiresAt } =
        emailVerificationTokenResponse;
      this.logger.log(
        `Verification token generated for user ${response.username}(${email}): ${inspect(emailVerificationTokenResponse)}`,
      );

      // salvo il token di verifica nel db
      const entity = this.tokenRepository.create({
        email: response.email,
        userId,
        token,
        expiresAt,
      });
      const saved = await this.tokenRepository.save(entity);

      const message = `User registered: ${response.username} (${response.email}). Verification URL: ${verificationUrl}`;

      this.auditService.safeLogRegistration(originDto, message, payload);

      return {
        success: true,
        link: verificationUrl,
        token,
        expiresAt,
        status: "pending" as RegistrationStatus,
        // message: "Registration successful: waiting for email verification",
        userId,
        email,
      };
    } catch (error) {
      // Keycloak di solito restituisce 409 o un errore con messaggio specifico
      if (
        error?.response?.status === HttpStatus.CONFLICT ||
        (typeof error?.response?.data === "string" &&
          error.response.data.includes("already exists"))
      ) {
        throw new UserAlreadyExistsException();
      }
      throw error;
    }
  }

  async loginUser(
    loggedUser: LoggedUser,
    payload: LoginUserDto,
  ): Promise<ILoginResult> {
    const { email, password, username } = payload;
    // 1️⃣ Validazione input
    if (!email && !username) {
      const message = "Either email or username is required";
      this.logger.error(message);
      throw new BadRequestException(message);
    }
    const userIdentifier = email ?? username ?? "";

    let userToken: IGetTokenResult;

    // 2️⃣ Richiesta token a Keycloak
    try {
      userToken = await this.keycloakService.getToken(
        userIdentifier,
        password,
        "openid",
      );
    } catch (error: any) {
      const message = error?.message ?? "Keycloak login failed";
      this.logger.error(message);

      // await this.auditService.safeLog(loggedUser, "LOGIN_FAILURE", message, {
      //   email,
      //   username,
      // });
      throw new UnauthorizedException(message);
    }

    const { access_token, refresh_token } = userToken;

    // 3️⃣ Controllo token
    if (!access_token) {
      const message = "Login failed: No access token returned";
      // await this.auditService.safeLog(loggedUser, "LOGIN_FAILURE", message, {
      //   email,
      //   username,
      // });
      throw new UnauthorizedException(message);
    }

    const tokenDto = new Token(
      loggedUser.token.originDto.originIp,
      loggedUser.token.originDto.originUserAgent,
      access_token,
      refresh_token,
    );
    // 4️⃣ Ottieni informazioni utente da Keycloak
    const userInfo: IKeycloakUserInfo =
      await this.keycloakService.getUserInfo(loggedUser);

    if (!userInfo.id) {
      const message =
        "Login failed: No userId returned from Keycloak user info";

      // await this.auditService.safeLog(loggedUser, "LOGIN_FAILURE", message, {
      //   email,
      //   username,
      // });

      throw new UnauthorizedException(message);
    }

    if (!userInfo.emailVerified) {
      const message = "Login failed: Email not verified";

      // await this.auditService.safeLog(loggedUser, "LOGIN_FAILURE", message, {
      //   email,
      //   username,
      //   userId: userInfo.id,
      // });

      throw new UnauthorizedException({
        code: LoginStatus.EMAIL_NOT_VERIFIED,
        message,
      });
    }

    // 5️⃣ Decodifica token
    const decodedToken: DecodedKeycloakToken =
      await this.keycloakService.decode(tokenDto);

    // // 6️⃣ Mappatura su LoggedUser
    // const loggedUser = this.userFactory.fromToken(
    //   decodedToken,
    //   originDto.originIp,
    //   originDto.originUserAgent,
    //   access_token,
    //   refresh_token
    // );

    // // 7️⃣ Audit login successo
    // await this.auditService.safeLog(
    //   loggedUser,
    //   "LOGIN_USER_SUCCESS",
    //   `User logged in: ${userIdentifier} (userId: ${userInfo.id})`,
    //   { email, username },
    // );

    // 8️⃣ Costruzione risultato
    const loginResult: ILoginResult = {
      access_token,
      refresh_token,
      userId: userInfo.id,
      emailVerified: userInfo.emailVerified,
      success: true,
      status: HttpStatus.OK,
      message: "Login successful",
      // loginStatus: LoginStatus.SUCCESS,
      loginStatus: AccessStatus.SUCCESS,
      // redirectUrl: '/dashboard', // opzionale, il controller decide
      email: userInfo.email,
      username: userInfo.username,
    };

    return loginResult;
  }

  async loginAdmin(
    loggedUser: LoggedUser,
    { email, password, username }: LoginUserDto,
  ): Promise<ILoginResult> {
    const emailOrUsername: string | undefined = email || username;
    if (!emailOrUsername) {
      this.logger.error("Either email or username is required");
      throw new BadRequestException("Either email or username is required");
    }
    let userToken: IGetTokenResult;
    try {
      userToken = await this.keycloakService.getToken(
        emailOrUsername,
        password,
        "openid",
      );
    } catch (error) {
      const { message } = error;
      this.logger.error(message);

      // this.auditService.safeLog(loggedUser, "LOGIN_FAILURE", message, {
      //   email,
      //   username,
      // });

      throw new UnauthorizedException(message);
    }

    const { access_token, refresh_token } = userToken;

    const { originIp, originUserAgent } = loggedUser.token.originDto;
    let tokenDto: Token = new Token(
      originIp,
      originUserAgent,
      access_token,
      refresh_token,
    );
    const info: IKeycloakUserInfo =
      await this.keycloakService.getUserInfo(loggedUser);

    const userId = info.id;

    if (!userId) {
      const message = "Login failed: No userId returned from user info";

      // this.auditService.safeLog(loggedUser, "LOGIN_FAILURE", message, {
      //   email,
      //   username,
      // });

      throw new UnauthorizedException(message);
    }

    if (!info.emailVerified) {
      const message = "Login failed: Email not verified";

      // this.auditService.safeLog(loggedUser, "LOGIN_FAILURE", message, {
      //   email,
      //   username,
      //   userId,
      // });

      throw new UnauthorizedException({
        code: LoginStatus.EMAIL_NOT_VERIFIED,
        message,
      });
    }

    if (!access_token) {
      const message = "Login failed: No access token returned";

      // this.auditService.safeLog(loggedUser, "LOGIN_FAILURE", message, {
      //   email,
      //   username,
      //   userId,
      // });

      throw new UnauthorizedException(message);
    }

    const decodedKeycloakToken: DecodedKeycloakToken =
      await this.keycloakService.decode(tokenDto);

    // const loggedUser = this.userFactory.fromToken(
    //   decodedKeycloakToken,
    //   originIp,
    //   originUserAgent,
    //   access_token,
    //   refresh_token
    // );

    // const extendedToken = await this.verificationTokenService.exchangeToken(
    //   access_token,
    //   tenantId,
    //   {
    //     tokenType: TokenType.ACCESS,
    //     expirationMinutes: 60, // 1 hour
    //   }
    // );
    // this.logger.debug(`Extended token: ${inspect(extendedToken)}`);

    const loginResult: ILoginResult = {
      ...userToken,
      userId,
      success: true,
      status: HttpStatus.OK,
      message: "Login successful",
      // loginStatus: LoginStatus.SUCCESS,
      loginStatus: AccessStatus.SUCCESS,
      access_token,
      refresh_token,
      emailVerified: info.emailVerified,
      // tenantId: undefined,
    };

    if (!loginResult) {
      const message = "Login failed: No result returned";

      // this.auditService.safeLog(loggedUser, "LOGIN_FAILURE", message, {
      //   email,
      //   username,
      //   userId,
      // });

      throw new InternalServerErrorException(message);
    }

    // this.auditService.safeLog(
    //   loggedUser,
    //   "LOGIN_ADMIN_USER_SUCCESS",
    //   `User logged in: ${email || username} (userId: ${userId})`,
    //   { email, username, userId },
    // );

    return loginResult;
  }

  /**
   * Check if user email is verified
   */
  async checkEmailVerification(
    loggedUser: LoggedUser,
    email: string,
  ): Promise<boolean> {
    try {
      // Get admin token
      const adminTokenResponse: ITokenResponse =
        await this.keycloakService.getAdminToken();
      this.logger.debug(
        `Admin token retrieved: ${inspect(adminTokenResponse)}`,
      );
      // Find user by email
      const user: IKeycloakUser = await this.keycloakService.getUserByEmail(
        loggedUser,
        email,
        adminTokenResponse,
      );
      if (!user) {
        throw new NotFoundException("User not found");
      }
      this.logger.debug(`User found: ${inspect(user)}`);
      // Check if email is verified
      const userInfo = await this.keycloakService.getUserInfo(loggedUser);
      this.logger.debug(
        `Check if email is verified: ${userInfo.emailVerified}`,
      );
      return userInfo.emailVerified;
    } catch (error) {
      // this.logger.error(
      //   `Error checking email verification for ${email}: ${inspect(error)}`
      // );
      throw new InternalServerErrorException(
        `Error checking email verification for ${email}: ${inspect(error)}`,
      );
    }
  }

  /**
   * Generate password reset link
   */
  async generatePasswordResetLink(
    loggedUser: LoggedUser,
    email: string,
  ): Promise<string> {
    try {
      // Get admin token to find user
      const adminTokenResponse: ITokenResponse =
        await this.keycloakService.getAdminToken();

      // Find user by email
      const user: IKeycloakUser = await this.keycloakService.getUserByEmail(
        loggedUser,
        email,
        adminTokenResponse,
      );
      if (!user) {
        throw new NotFoundException("User not found");
      }

      const baseUrl = process.env.FRONTEND_URL;
      if (!baseUrl) {
        throw new EnvNotFoundException("FRONTEND_URL");
      }

      // Generate password reset link using VerificationTokenService
      const verificationResult: IVerificationResult =
        this.verificationTokenService.generateEmailVerificationToken({
          userId: user.id,
          email,
          tokenType: TokenType.PASSWORD_RESET,
          // expiresIn: '1h', // Password reset links should expire quickly
          expirationMinutes: 60, // 1 h
          baseUrl,
        });

      this.logger.log(
        `Password reset link generated for ${email} (userId: ${user.id})`,
      );

      return verificationResult.verificationUrl;
    } catch (error) {
      this.logger.error(
        `Error generating password reset link for ${email}: ${inspect(error)}`,
      );
      throw new InternalServerErrorException(
        "Failed to generate password reset link",
      );
    }
  }

  async validateEmailVerificationToken(
    loggedUser: LoggedUser,
    email: string,
    token: string,
  ): Promise<boolean> {
    try {
      const tokenDto: Token = loggedUser.getToken();
      const user: IKeycloakUser = await this.keycloakService.findUserByEmail(
        tokenDto,
        email,
      );
      if (!user) {
        // throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        this.logger.error(`User not found for email: ${email}`);
        return false;
      }
      const userId = user.id;

      // const options: VerificationLinkOptions = {
      //   userId,
      //   email,
      //   tokenType: TokenType.EMAIL_VERIFICATION,
      //   expirationMinutes: this.verificationTokenService.defaultExpirationMinutes[TokenType.EMAIL_VERIFICATION],
      // };

      // const verificationTokenResponse = this.verificationTokenService.createVerificationToken(options);

      // cerco il token tra quelli validi per questo indirizzo email
      const verificationEmailToken =
        await EmailVerificationToken.findValidByEmail(
          email,
          this.tokenRepository,
        );
      if (verificationEmailToken === null) {
        this.logger.error(
          `No valid email verification token found for email: ${email}`,
        );
        throw new NotFoundException(
          `No valid email verification token found for email: ${email}`,
        );
      }
      this.logger.debug(
        `verificationEmailToken: ${inspect(verificationEmailToken)}`,
      );

      const { token: storedToken } = verificationEmailToken;
      this.logger.debug(
        `Validating email verification token for userId: ${userId} and email: ${email}:\ntoken=${token}\nverifiedWith=${storedToken}`,
      );
      const isVerified = token === storedToken;
      this.logger.debug(
        `Email verification token validation for ${email} (userId: ${userId}): ${isVerified}`,
      );

      if (isVerified) {
        // imposto l'email dell'utente come verificata su keycloak
        await this.keycloakService.setVerifiedEmailOf(tokenDto, userId, email);
        verificationEmailToken.used = true;
        await this.tokenRepository.save(verificationEmailToken);
        this.logger.log(
          `Email ${email} verified successfully for userId: ${userId}`,
        );
      }

      return isVerified;
    } catch (error) {
      this.logger.error(
        `Error validating email verification token for ${email}: ${inspect(error)}`,
      );
      throw new InternalServerErrorException(
        "Failed to validate email verification token",
      );
    }
  }

  /**
   * Invalida il token Keycloak lato server (logout globale)
   * @param {LoggedUser} loggedUser - opzionale, se fornito effettua il logout solo di quel token
   * @return {Promise<{ success: boolean }>} - Risultato dell'operazione di logout
   */
  async logout(loggedUser: LoggedUser): Promise<{ success: boolean }> {
    try {
      // Se non hai il token, non puoi invalidare lato Keycloak
      if (!loggedUser.token.accessToken) {
        this.logger.warn(
          "Nessun accessToken fornito per logout, impossibile invalidare lato Keycloak",
        );
        return { success: false };
      }
      // Chiama l'endpoint di logout OIDC di Keycloak
      const data = new URLSearchParams();
      data.append("client_id", this.keycloakService.clientId);
      data.append("client_secret", this.keycloakService.clientSecret);
      // data.append("refresh_token", loggedUser.token.refreshToken); // FIXME: usare refresh_token /!\
      const logoutUrl = `${this.keycloakService.baseUrl}/logout`;
      await firstValueFrom(
        this.httpService.post(logoutUrl, data, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }),
      );
      this.logger.log("Logout Keycloak effettuato con successo");
      return { success: true };
    } catch (error) {
      this.logger.error("Errore durante il logout Keycloak:", error);
      return { success: false };
    }
  }

  /**
   * Aggiorna l'access_token dell'utente loggato
   * @param {LoggedUser} loggedUser -
   * @returns {ILoginResult}
   */
  async refreshToken(loggedUser: LoggedUser): Promise<ILoginResult> {
    try {
      const rt = loggedUser?.refreshToken;
      if (!rt) {
        this.logger.warn(
          "refreshToken called without a refresh_token on LoggedUser",
        );
        throw new UnauthorizedException("Missing refresh token");
      }

      const refreshed: IGetTokenResult =
        await this.keycloakService.refreshToken(rt);

      const result: ILoginResult = {
        success: true,
        status: HttpStatus.OK,
        loginStatus: AccessStatus.SUCCESS,
        message: "Token refreshed",
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        userId: loggedUser.id,
        // tenantId: loggedUser.tenantId,
      };

      return result;
    } catch (error) {
      this.logger.error(`Error refreshing token: ${inspect(error)}`);
      throw new UnauthorizedException("Failed to refresh token");
    }
  }

  /**
   * Restituisce un token esteso con il tenantId
   *
   * @param {OriginDto} originDto - informazioni sull'origine della richiesta
   * @param {object} params - parametri contenenti userId e keycloakToken
   * @param {string} params.userId - ID dell'utente
   * @param {string} params.keycloakToken - token Keycloak da scambiare
   * @returns {Promise<{ token: string }>} - token esteso con tenantId
   */
  async internaleExchangeToken(
    originDto: OriginDto,
    {
      userId,
      keycloakToken,
    }: {
      userId: string;
      keycloakToken: string;
    },
  ): Promise<{ token: string }> {
    try {
      const profile = await this.httpProcessService.getProfile(
        originDto,
        userId,
      );
      if (!profile || profile === null) {
        this.logger.error(
          `No profile found for userId: ${userId} during token exchange`,
        );
        throw new NotFoundException("User profile not found");
      }

      const { tenantId } = profile;
      if (!tenantId || tenantId === null) {
        this.logger.error(
          `No default tenantId found for userId: ${userId} during token exchange`,
        );
        throw new NotFoundException("Default tenant ID not found for user");
      }

      const extendedToken = await this.verificationTokenService.exchangeToken(
        keycloakToken,
        tenantId,
      );

      return extendedToken;
    } catch (error) {
      this.logger.error(`Error exchanging token: ${inspect(error)}`);
      throw new UnauthorizedException("Failed to exchange token");
    }
  }

  async generateFullAccessToken(
    loggedUser: LoggedUser,
    payload: FullAccessTokenDto,
  ): Promise<string> {
    return this.jwtService.sign(payload, {
      issuer: "dike-auth-service",
      audience: "dike-internal",
      expiresIn: "15m",
    });
  }
}
