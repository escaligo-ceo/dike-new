import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  OriginIp,
  OriginUserAgent,
  Profile,
  Token,
  userIdFromToken,
} from "@dike/common";
import {
  ApiGatewayService,
  BaseController,
  JwtAuthGuard,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Render,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

@UseGuards(JwtAuthGuard)
@Controller("profile")
export class ProfileController extends BaseController {
  constructor(
    // private readonly profileService: ProfileService,
    protected readonly logger: AppLogger,
    protected readonly userFactory: UserFactory,
    protected readonly configService: DikeConfigService,
    private readonly apiGatewayService: ApiGatewayService
  ) {
    super(new AppLogger(ProfileController.name), configService, userFactory);
  }

  @Get("user")
  @Version("1")
  @Render("profile")
  @ApiOperation({ summary: "Retrieve user homepage (or user landingPage)" })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: "Registrazione fallita",
  })
  async getUserProfile(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ): Promise<Profile> {
    this.logRequest(req, "getUserProfile");
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const [userProfile, created] =
      await this.apiGatewayService.findOrCreateProfile(loggedUser);
    this.logger.log(`Profile founded for user ID: ${loggedUser.id}`);
    return userProfile;
  }

  @Post("user")
  @Version("1")
  @ApiOperation({ summary: "Update user profile" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Profile updated successfully",
  })
  async updateUserProfile(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authentication: string,
    @Body() data: Partial<Profile>,
    @Req() req
  ): Promise<Profile> {
    this.logRequest(req, "updateUserProfile");
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authentication
    );
    const tokenDto: Token = new Token(originIp, originUserAgent, authentication);
    const userId = userIdFromToken(authentication);
    const updatedProfile = await this.apiGatewayService.updateProfile(
      loggedUser,
      data,
    );
    this.logger.log(`Profile updated for user ID: ${loggedUser.id}`);
    return updatedProfile;
  }
}
