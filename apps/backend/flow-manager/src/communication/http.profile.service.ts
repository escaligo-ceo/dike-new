import { AppLogger, DikeConfigService, OriginDto, Profile } from "@dike/common";
import { AuditService, BaseHttpService } from "@dike/communication";
import {
  FindOrCreateProfileRequest,
  FindOrCreateProfileResponse,
} from "@dike/contracts";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class HttpProfileService extends BaseHttpService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    private readonly auditService: AuditService
  ) {
    super(
      httpService,
      new AppLogger(HttpProfileService.name),
      configService,
      configService.env("PROFILE_SERVICE_URL", "http://localhost:8004/api")
    );
  }

  async internalFindOrCreateProfile(
    originDto: OriginDto,
    body: FindOrCreateProfileRequest
  ): Promise<FindOrCreateProfileResponse> {
    const userId = body.profileData.userId;

    this.logger.debug(`Find or create profile for userId: ${userId}`);
    const primaryUrl = "/v1/profiles/internal/find-or-create";

    const response = await this.post(
      primaryUrl,
      { profileData: body.profileData, userId },
      originDto,
      { "Content-Type": "application/json" }
    );
    this.logger.log(
      `findOrCreateProfile response ok for userId: ${response?.data?.userId ?? userId}`
    );
    return response.data;
  }

  async internalGetProfileByUserId(
    originDto: OriginDto,
    userId: string
  ): Promise<Profile> {
    const primaryUrl = `/profiles/internal/${userId}`;
    const response = await this.get(primaryUrl, originDto, {
      "Content-Type": "application/json",
    });
    return response.data;
  }
}
