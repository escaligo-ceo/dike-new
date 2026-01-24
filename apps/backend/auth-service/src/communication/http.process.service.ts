import {
  AppLogger,
  DikeConfigService,
  IOnboardingResponse,
  OriginDto,
} from "@dike/common";
import { BaseHttpService } from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class HttpProcessService extends BaseHttpService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService
  ) {
    super(
      httpService,
      new AppLogger(HttpProcessService.name),
      configService,
      configService.env("PROCESS_SERVICE_BASE_URL", "http://localhost:3001/api")
    );
  }

  async getOnboardingStatus(
    originDto: OriginDto,
    userId: string
  ): Promise<IOnboardingResponse> {
    const url = `/v1/onboarding/status`;
    const response = await this.get(url, originDto, {
      "Content-Type": "application/json",
    });
    return response.data;
  }

  async getOnboardingForUser(
    originDto: OriginDto,
    userId: string
  ): Promise<IOnboardingResponse> {
    const url = `/v1/onboarding/${userId}`;
    const response = await this.get(url, originDto);
    return response.data;
  }

  async stepOnboarding(originDto: OriginDto, userId: string): Promise<void> {
    const url = `/v1/onboarding/${userId}/step`;
    await this.post(url, {}, originDto);
  }

  async getProfile(originDto: OriginDto, userId: string) {
    const url = `/v1/profiles/${userId}`;
    const response = await this.get(url, originDto);
    return response.data;
  }
}
