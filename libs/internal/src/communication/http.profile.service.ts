import { AppLogger, DikeConfigService, inspect, OriginDto, Profile } from "@dike/common";
import { AuditService, BaseHttpService, LoggedUser } from "@dike/communication";
import { FindOrCreateProfileResponse } from "@dike/contracts";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class HttpProfileService extends BaseHttpService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    private readonly auditService: AuditService // Assuming you have an audit service for logging errors
  ) {
    super(
      httpService,
      new AppLogger(HttpProfileService.name),
      configService,
      configService.env("PROFILE_SERVICE_URL", "http://localhost:8004/api")
    );
  }

  async findOrCreateProfile(
    loggedUser: LoggedUser,
    profileData: Partial<Profile>
  ): Promise<FindOrCreateProfileResponse> {
    const userId = profileData.userId;

    this.logger.debug(`Find or create profile for userId: ${userId}`);
    const url = "/v1/profiles/find-or-create";
    const response = await this.post(
      url,
      { ...profileData, userId },
      loggedUser.token.originDto
    );
    this.logger.log(
      `findOrCreateProfile response data: ${response.data[0].userId}`
    );
    return response.data;
  }

  async updateProfile(
    loggedUser: LoggedUser,
    profileData: Partial<Profile>
  ): Promise<Profile> {
    const userId = profileData.userId || loggedUser.id;
    if (!userId) {
      console.trace();
      this.logger.error(
        `Invalid token provided to updateProfile: ${inspect(origin)}`
      );
      throw new Error("Invalid token");
    }
    const url = `/v1/profiles/${userId}`;
    this.logger.log(
      `updating user profile for user ID: ${userId} with data: ${inspect(profileData)}`
    );
    const res = await this.patch(url, profileData, loggedUser.token.originDto);

    this.auditService.safeLog(
      loggedUser,
      "UPDATE_PROFILE",
      `Failed to update profile for user ID: ${userId}`,
      { profileData }
    );

    return res.data;
  }

  async internalFindOrCreateProfile(
    originDto: OriginDto,
    userId: string
  ): Promise<FindOrCreateProfileResponse> {
    const url = "/v1/internal/profiles/find-or-create";
    const response = await this.post(
      url,
      { userId },
      originDto
    );
    return response.data;
  }
}
