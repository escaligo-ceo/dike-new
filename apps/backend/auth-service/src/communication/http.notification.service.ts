import { AppLogger, DikeConfigService } from "@dike/common";
import { BaseHttpService, LoggedUser } from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class HttpNotificationService extends BaseHttpService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService
  ) {
    super(
      httpService,
      new AppLogger(HttpNotificationService.name),
      configService,
      configService.env("NOTIFICATION_SERVICE_URL", "http://localhost:8007/api")
    );
  }

  async sendVerificationEmail(
    loggedUser: LoggedUser,
    email: string,
    link: string
  ): Promise<void> {
    const payload = {
      to: email,
      link,
    };

    const res = await this.post(
      "/v1/email/verification",
      payload,
      loggedUser.token.originDto
    );
    return res.data;
  }
}
