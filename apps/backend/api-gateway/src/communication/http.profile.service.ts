import { AppLogger, DikeConfigService, inspect, Profile } from "@dike/common";
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

    // this.auditService.safeLog(
    //   loggedUser,
    //   "UPDATE_PROFILE",
    //   `Updated profile for user ID: ${userId}`,
    //   { profileData }
    // );

    return res.data;
  }

  async updateAccountSettings(
    loggedUser: LoggedUser,
    dto: any
  ): Promise<any> {
    this.logger.debug("HttpProfileService.updateAccountSettings");
    const res = await this.post(
      "/v1/settings/me/account",
      dto,
      loggedUser.token.originDto
    );
    // this.auditService.safeLog(
    //   loggedUser,
    //   "UPDATE_ACCOUNT_SETTINGS",
    //   `Updated account settings for user ID: ${loggedUser.id}`,
    //   dto
    // );
    return res.data;
  }

  async updateSessionSettings(
    loggedUser: LoggedUser,
    dto: any
  ): Promise<any> {
    this.logger.debug("HttpProfileService.updateSessionSettings");
    const res = await this.post(
      "/v1/settings/me/sessions",
      dto,
      loggedUser.token.originDto
    );

    return res.data;
  }

  async updateNotificationSettings(
    loggedUser: LoggedUser,
    dto: any
  ): Promise<any> {
    this.logger.debug("HttpProfileService.updateNotificationSettings");
    const res = await this.post(
      "/v1/settings/me/notifications",
      dto,
      loggedUser.token.originDto
    );

    return res.data;
  }

  async updateTeamSettings(loggedUser: LoggedUser, dto: any): Promise<any> {
    this.logger.debug("HttpProfileService.updateTeamSettings");
    const res = await this.post(
      "/v1/settings/me/teams",
      dto,
      loggedUser.token.originDto
    );

    return res.data;
  }

  async updateApiKeysSettings(loggedUser: LoggedUser, dto: any): Promise<any> {
    this.logger.debug("HttpProfileService.updateApiKeysSettings");
    const res = await this.post(
      "/v1/settings/me/api-keys",
      dto,
      loggedUser.token.originDto
    );

    return res.data;
  }

  // async updateTeamSettings(dto: any): Promise<any> {
  //   const res = await this.post('/v1/settings/me/team', dto);
  //   // const decoded = jwt.decode(accessToken);
  //   this.logger.debug(`Decoded JWT: ${inspect(decoded)}`);
  //   const userId = decoded?.sub || undefined;

  //   return {
  //     ...res,
  //     userId,
  //   } as AxiosResponse<any, any>;
  // }

  async getOnboardingCurrentStep(loggedUser: LoggedUser): Promise<number> {
    const url = `/v1/onboarding`;
    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  async getOnboardingNextStep(loggedUser: LoggedUser): Promise<number> {
    const url = `/v1/onboarding/next`;
    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  async findByUserId(
    loggedUser: LoggedUser,
    userId?: string
  ): Promise<Profile | null> {
    const url = `/v1/profiles/${userId ?? loggedUser.id}`;
    const response = await this.get(url, loggedUser.token.originDto);
    this.logger.debug(`findByUserId response data: ${inspect(response.data)}`);
    return response.data || null;
  }

  async findProfileByLoggedUser(
    loggedUser: LoggedUser
  ): Promise<Profile | null> {
    const queryParams = new URLSearchParams();
    const token = loggedUser.token.accessToken;
    if (!token) {
      this.logger.error(
        `Invalid token provided to findProfileByLoggedUser: ${inspect(loggedUser)}`
      );
      throw new Error("Invalid token");
    }
    queryParams.append("token", token);
    const queryStr = `?${queryParams.toString()}`;

    const url = `/v1/profiles${queryStr}`;
    this.logger.debug(`Finding profile by token, URL: ${url}`);
    // this.logger.debug(`Using token: ${token}`); // Avoid logging sensitive tokens
    const response = await this.get(url, loggedUser.token.originDto);
    this.logger.debug(`Response data: ${inspect(response.data)}`);
    return response.data || null;
  }

  // async isStepAllowed(loggedUser: LoggedUser, step: number): Promise<boolean> {
  //   // if (tokenDto.token === "undefined" || !tokenDto.token) {
  //   //   console.trace();
  //   //   this.logger.error("Invalid token provided to isStepAllowed");
  //   //   throw new EnvNotFoundException("Invalid token");
  //   // }
  //   try {
  //     if (!tokenDto.token) {
  //       this.logger.error("Invalid token provided to isStepAllowed");
  //       throw new EnvNotFoundException("Invalid token");
  //     } else {
  //       this.logger.log(inspect(tokenDto));
  //     }
  //     const queryParams = new URLSearchParams({
  //       page: step.toString(),
  //       token: tokenDto.token,
  //     });
  //     const userId = userIdFromToken(tokenDto.token);
  //     this.logger.debug(
  //       `Checking if step ${step} is allowed for userId ${userId}`
  //     );
  //     const queryStr = `?${queryParams.toString()}`;
  //     const url = `/v1/onboarding/allowed${queryStr}`;
  //     const response = await this.get(url, {
  //       ...tokenDto,
  //       authorization: tokenDto.token,
  //     });
  //     return response.data;
  //   } catch (error) {
  //     this.logger.error(
  //       `Error in isStepAllowed while fetching profile: ${inspect(error)}`
  //     );
  //     throw error;
  //   }
  // }

  // async updateDefaultRedirectUrl(
  //   userId: string,
  //   loggedUser: LoggedUser,
  //   profileData: Partial<Profile>,
  //   currentPage: number
  // ): Promise<string> {
  //   // const userId = profileData.userId || userIdFromToken(tokenDto.token);
  //   if (!userId) {
  //     console.trace();
  //     this.logger.error(
  //       `Invalid token provided to updateDefaultRedirectUrl: ${inspect(
  //         tokenDto
  //       )}`
  //     );
  //     throw new EnvNotFoundException("Invalid token");
  //   }
  //   // const url = `/v1/profiles/${userId}/default-redirect?page=${currentPage}`;
  //   const url = `/v1/profiles/${userId}`;
  //   const data = {
  //     defaultRedirectUrl: profileData.defaultRedirectUrl,
  //     lastCompletedOnBoardingStep: profileData.lastCompletedOnBoardingStep,
  //   };

  //   this.logger.log(
  //     `updating default redirect URL for user ID: ${userId} with data: ${inspect(
  //       data
  //     )} at page: ${currentPage}`
  //   );
  //   const res = await this.patch(url, data, loggedUser);
  //   this.auditService.log(
  //     loggedUser,
  //     "UPDATE_PROFILE",
  //     `Updated default redirect URL for user ID: ${userId}`,
  //     { defaultRedirectUrl: profileData.defaultRedirectUrl, currentPage }
  //   );
  //   return res.data;
  // }

  async getProfileSettings(loggedUser: LoggedUser): Promise<any> {
    this.logger.debug("HttpProfileService.getProfileSettings");
    const res = await this.get("/v1/settings/me", loggedUser.token.originDto);

    return res.data;
  }

  async updateProfileSettings(
    loggedUser: LoggedUser,
    settingsData: any
  ): Promise<any> {
    this.logger.debug("HttpProfileService.updateProfileSettings");
    const res = await this.post(
      "/v1/settings/me",
      settingsData,
      loggedUser.token.originDto
    );

    return res.data;
  }

  async updateProfileVisibilitySettings(
    loggedUser: LoggedUser,
    settingsData: any
  ): Promise<any> {
    this.logger.debug("HttpProfileService.updateProfileVisibilitySettings");
    const res = await this.post(
      "/v1/settings/me/visibility",
      settingsData,
      loggedUser.token.originDto
    );

    return res.data;
  }
}
