import {
  AppLogger,
  DikeConfigService,
  ILoginResult,
  IRegisterUserResult,
  KeycloakUserDto,
  LoginUserDto,
  OriginDto,
} from "@dike/common";
import {
  BaseHttpService,
  IKeycloakUser,
  LoggedUser,
} from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import axios, { AxiosError } from "axios";
import { config } from "process";

@Injectable()
export class HttpAuthService extends BaseHttpService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
  ) {
    super(
      httpService,
      new AppLogger(HttpAuthService.name),
      configService,
      configService.env("AUTH_SERVICE_URL", "http://localhost:8001/api")
    );
    this.logger = new AppLogger(HttpAuthService.name);
  }

  async register(
    originDto: OriginDto,
    keycloakUserDto: KeycloakUserDto
  ): Promise<IRegisterUserResult> {
    this.logger.debug("HttpAuthService.register");
    const res = await this.post("/v1/register", keycloakUserDto, originDto);
    // this.logger.debug(`Response: ${inspect(res.data)}`);
    return res.data;
  }

  async login(
    originDto: OriginDto,
    dto: LoginUserDto
  ): Promise<ILoginResult> {
    const res = await this.post("/v1/login", dto, originDto);
    return res.data;
  }

  async loginAdmin(
    originDto: OriginDto,
    body: LoginUserDto
  ): Promise<ILoginResult> {
    const res = await this.post("/v1/admin/auth/login", body, originDto);
    return res.data;
  }

  async findUserByEmail(
    loggedUser: LoggedUser,
    email: string
  ): Promise<IKeycloakUser> {
    const res = await this.get(
      `/v1/users?email=${email}`,
      loggedUser.token.originDto
    );
    return res.data;
  }

  async saveEmailVerificationToken(
    loggedUser: LoggedUser,
    userId: string,
    verificationToken: string
  ): Promise<void> {
    const url = `/v1/profiles/${userId}/email-verification`;
    try {
      await this.post(
        url,
        { token: verificationToken },
        loggedUser.token.originDto
      );
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(
        `Failed to save email verification token for user ID: ${userId}`,
        error
      );
      if (err.response) {
        throw new HttpException(err.response.data as any, err.response.status);
      }
      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async verifyEmail(
    originDto: OriginDto,
    to: string,
    verificationLink: string
  ): Promise<boolean> {
    const emailParam = encodeURIComponent(to);
    const verificationLinkParam = encodeURIComponent(verificationLink);
    const url = `/v1/tokens/verify-email?email=${emailParam}&token=${verificationLinkParam}`;
    try {
      const response = await this.get(url, originDto);

      const res: { valid: boolean } = response.data;
      return res.valid;
    } catch (error) {
      this.logger.error(`Failed to verify email for ${to}`, error);
      if (axios.isAxiosError(error) && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException(
        "Internal server error",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async logout(loggedUser: LoggedUser): Promise<any> {
    await loggedUser.initialize();
    const res = await this.post(
      "/v1/logout",
      { accessToken: loggedUser.token.accessToken },
      loggedUser.token.originDto
    );
    return res.data;
  }

  async refreshToken(
    loggedUser: LoggedUser,
    userId: string
  ): Promise<ILoginResult> {
    const url = `/v1/auth/refresh-token`;
    const data = {
      userId,
    };
    const res = await this.post(url, data, loggedUser.token.originDto);
    return res.data;
  }

  async internalExchangeToken(
    originDto: OriginDto,
    token: string
  ): Promise<{ token: string }> {
    const res = await this.post(
      `/v1/auth/internal-exchange-token`,
      { token },
      originDto
    );
    return res.data;
  }
}
