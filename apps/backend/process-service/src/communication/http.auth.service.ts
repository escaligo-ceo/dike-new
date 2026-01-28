import {
  AppLogger,
  DikeConfigService,
  FullAccessTokenDto,
  ILoginResult,
  LoginUserDto,
  OriginDto,
} from "@dike/common";
import { BaseHttpService, LoggedUser } from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class HttpAuthService extends BaseHttpService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService
  ) {
    super(
      httpService,
      new AppLogger(HttpAuthService.name),
      configService,
      configService.env("AUTH_SERVICE_URL", "http://localhost:8000/api")
    );
  }

  async internalExchangeToken(
    originDto: OriginDto,
    token: string
  ): Promise<{ token: string }> {
    const res = await this.post(
      `/v1/internal/auth/exchange-token`,
      { token },
      originDto
    );
    return res.data;
  }

  async login(originDto: OriginDto, dto: LoginUserDto): Promise<ILoginResult> {
    const res = await this.post(`/v1/auth/login`, dto, originDto);
    return res.data;
  }

  async getUser(loggedUser: LoggedUser): Promise<any> {
    const res = await this.get(`/v1/auth/user`, loggedUser.token.originDto);
    return res.data;
  }

  async generateFullAccessToken(
    loggedUser: LoggedUser,
    payload: FullAccessTokenDto
  ): Promise<string> {
    const res = await this.post(
      `/v1/auth/full-access-token`,
      payload,
      loggedUser.token.originDto,
      { "Content-Type": "application/json" }
    );
    return res.data.token;
  }
}
