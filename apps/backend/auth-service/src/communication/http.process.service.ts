import { AppLogger, DikeConfigService, IOnboardingResponse, OriginDto } from "@dike/common";
import { BaseHttpService, LoggedUser } from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class HttpProcessService extends BaseHttpService {
  constructor(
    httpService: HttpService,
    logger: AppLogger,
    configService: DikeConfigService
  ) {
    super(
      httpService as any,
      new AppLogger(HttpProcessService.name),
      configService,
      configService.env("FLOW_MANAGER_URL", "http://localhost:8005/api")
    );
  }

  async getOnboardingStatus(
    user: LoggedUser
  ): Promise<IOnboardingResponse> {
    const url = `/v1/onboarding/status`;
    const response = await this.get(url, user.token.originDto, {
      "Content-Type": "application/json",
    });
    return response.data;
  }

  async getOnboardingForUser(
    user: LoggedUser
  ): Promise<IOnboardingResponse> {
    const url = `/v1/onboarding/${user.id}`;
    const response = await this.get(url, user.token.originDto);
    return response.data;
  }

  async stepOnboarding(
    user: LoggedUser
  ): Promise<void> { // FIXME: change return type when API is ready
    const url = `/v1/onboarding/${user.id}/step`;
    await this.post(url, {}, user.token.originDto);
  }

  async getProfile(
    // user: LoggedUser
    originDto: OriginDto,
    userId: string,
  ): Promise<any> { // FIXME: change return type when API is ready
    const url = `/v1/profiles/${userId}`;
    const response = await this.get(url, originDto);
    return response.data;
  }
}
