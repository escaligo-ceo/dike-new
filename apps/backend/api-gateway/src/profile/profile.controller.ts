import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  inspect,
  OriginIp,
  OriginUserAgent,
  Profile,
  profileTableName,
} from "@dike/common";
import {
  BaseController,
  JwtAuthGuard,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import {
  FindOrCreateProfileRequest,
  FindOrCreateProfileResponse,
} from "@dike/contracts";
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { HttpProfileService } from "../communication/http.profile.service";

@UseGuards(JwtAuthGuard)
@Controller(profileTableName)
export class ProfileController extends BaseController {
  constructor(
    private readonly httpProfileService: HttpProfileService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory
  ) {
    super(new AppLogger(ProfileController.name), configService, userFactory);
  }

  @Post("find-or-create")
  @Version("1")
  async findOrCreateProfile(
    @AuthorizationBearer() authorization: string,
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @Body() body: FindOrCreateProfileRequest,
    @Req() req
  ): Promise<FindOrCreateProfileResponse> {
    this.logRequest(req, `findOrCreateProfile`);
    const { userId } = body.profileData;
    if (!userId) {
      throw new Error("userId is required in profileData");
    }
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpProfileService.findOrCreateProfile(
      loggedUser,
      body.profileData
    );
  }

  @Post()
  @Version("1")
  @ApiOperation({ summary: "Update user profile" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Profile updated successfully",
  })
  async createProfile(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Body() profileData: Partial<Profile>,
    @Req() req
  ): Promise<Profile> {
    this.logRequest(
      req,
      `createProfile called for userId: ${profileData.userId}`
    );
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpProfileService.updateProfile(loggedUser, profileData);
  }

  @Get(":userId")
  @Version("1")
  @ApiOperation({ summary: "Retrieve user profile by userId" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Profile retrieved successfully",
  })
  async findByUserId(
    @Param("userId") userId: string,
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ): Promise<Profile | null> {
    this.logRequest(req, `findByUserId`);
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const response = await this.httpProfileService.findByUserId(
      loggedUser,
      userId
    );
    this.logger.log(`Profile found: ${inspect(response)}`);
    return response;
  }

  @Patch(":userId")
  @Version("1")
  @ApiOperation({ summary: "Update user's default redirect URL" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Default redirect URL updated successfully",
  })
  async updateProfile(
    @Body() profileData: Partial<Profile>,
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Param("userId") userId: string,
    @Req() req
  ): Promise<Profile> {
    this.logRequest(req, `updateProfile called for userId: ${userId}`);
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const res = await this.httpProfileService.updateProfile(loggedUser, {
      userId,
      ...profileData,
    });
    return res;
  }

  @Get("profile/settings")
  @Version("1")
  @ApiOperation({ summary: "Retrieve user profile settings" })
  async getProfileSettings(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ): Promise<any> {
    this.logRequest(req, `getProfileSettings`);
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpProfileService.getProfileSettings(loggedUser);
  }

  @Put("profile/settings")
  @Version("1")
  @ApiOperation({ summary: "Update user profile settings" })
  async updateProfileSettings(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Body() settingsData: any,
    @Req() req
  ): Promise<any> {
    this.logRequest(req, `updateProfileSettings`);
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpProfileService.updateProfileSettings(
      loggedUser,
      settingsData
    );
  }

  @Put("profile/settings/visibility")
  @Version("1")
  @ApiOperation({ summary: "Update user profile visibility settings" })
  async updateProfileVisibilitySettings(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Body() settingsData: any,
    @Req() req
  ): Promise<any> {
    this.logRequest(req, `updateProfileVisibilitySettings`);
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpProfileService.updateProfileSettings(
      loggedUser,
      settingsData
    );
  }
}
