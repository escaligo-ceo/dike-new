import {
  AppLogger,
  BaseUrl,
  DikeConfigService,
  inspect,
  Invite,
  OriginDto,
  VerificationDto,
} from "@dike/common";
import { AuditService, BaseHttpService, LoggedUser } from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable, Post } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class HttpNotificationService extends BaseHttpService {
  private readonly frontendServiceParams: BaseUrl;

  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly auditService: AuditService
  ) {
    super(
      httpService,
      new AppLogger(HttpNotificationService.name),
      configService,
      configService.env("NOTIFICATION_SERVICE_URL", "http://localhost:8006/api")
    );

    const frontendServiceUrl = this.configService.env(
      "FRONTEND_URL",
      "http://localhost:5172"
    );
    this.frontendServiceParams = new BaseUrl(frontendServiceUrl);
  }

  public get frontendBaseUrl(): string {
    return this.frontendServiceParams.baseUrl();
  }

  @Post("verification")
  async sendEmailVerification(
    loggedUser: LoggedUser,
    dto: VerificationDto
  ): Promise<void> {
    const requestUrl = `/v1/email/verification`;
    try {
      const response = await this.post(
        requestUrl,
        dto,
        loggedUser.token.originDto
      );
      return response.data;
    } catch (error) {
      // if user profile does not exist, log the error and create a new profile
      // this.httpAuditService.error(`Failed to sent verification email to address: ${dto.email}`, error, DikeServiceName.API_GATEWAY);
      this.auditService.safeLog(
        loggedUser,
        "EMAIL_VERIFICATION",
        `Failed to sent verification email to address: ${dto.email}`,
        dto
      );

      if (axios.isAxiosError(error) && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }

      throw new HttpException(
        "Errore interno",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async sendVerificationEmail(
    originDto: OriginDto,
    email: string,
    link: string
  ): Promise<void> {
    const payload = {
      to: email,
      link,
    };

    const response = await this.post(
      "/v1/email/verification",
      payload,
      originDto
    );
    return response.data;
  }

  async sendTeamInviteEmail(
    loggedUser: LoggedUser,
    invite: Invite
  ): Promise<void> {
    const originDto: OriginDto = loggedUser.token.originDto;
    const payload = {
      to: invite.email,
      // teamName: invite.teamName,
      link: invite.link(this.frontendBaseUrl),
    };

    const response = await this.post(
      "/v1/email/team-invite",
      payload,
      originDto
    );
    return response.data;
  }

  async sendAlreadyRegisteredEmail(
    loggedUser: LoggedUser,
    email: string
  ): Promise<void> {
    const payload = {
      to: email,
      ...loggedUser.token.originDto,
    };

    await this.post(
      "/v1/email/already-registered",
      payload,
      loggedUser.token.originDto
    );
  }
}
