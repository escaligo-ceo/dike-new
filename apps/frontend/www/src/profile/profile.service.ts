import { AppLogger, Profile } from "@dike/common";
import { ApiGatewayService, LoggedUser } from "@dike/communication";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ProfileService {
  constructor(
    private readonly logger: AppLogger,
    private readonly apiGatewayService: ApiGatewayService
  ) {
    this.logger = new AppLogger(ProfileService.name);
  }

  // async findOrCreateProfile({
  //   token,
  //   originIp,
  //   originUserAgent,
  // }: Token): Promise<FindOrCreateProfileResponse> {
  //   const tokenDto: Token = new Token(originIp, originUserAgent, token);
  //   return this.apiGatewayService.findOrCreateUserProfileByToken(tokenDto);
  // }

  async updateUserProfile(
    loggedUser: LoggedUser,
    profileData: Partial<Profile>
  ): Promise<Profile> {
    return this.apiGatewayService.updateProfile(loggedUser, profileData);
  }

  async getOnboardingNextStep(loggedUser: LoggedUser): Promise<number> {
    return this.apiGatewayService.getOnboardingNextStep(loggedUser);
  }
}
