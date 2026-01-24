import { AppLogger, Profile } from "@dike/common";
import { LoggedUser } from "@dike/communication";
import { Injectable } from "@nestjs/common";
import { HttpProfileService } from "../communication/http.profile.service";
import { FindOrCreateProfileResponse } from "@dike/contracts";

@Injectable()
export class ProfileService {
  constructor(
    private readonly httpProfileService: HttpProfileService,
    private readonly logger: AppLogger
  ) {
    this.logger = new AppLogger(ProfileService.name);
  }

  async findOrCreate(
    loggedUser: LoggedUser,
    userId?: string
  ): Promise<FindOrCreateProfileResponse> {
    return this.httpProfileService.findOrCreateProfile(loggedUser, { userId });
  }

  async findByUserId(
    loggedUser: LoggedUser,
    userId?: string
  ): Promise<Profile | null> {
    return this.httpProfileService.findByUserId(loggedUser, userId);
  }

  async getByUserId(loggedUser: LoggedUser, userId?: string): Promise<Profile> {
    const profile: Profile | null = await this.findByUserId(loggedUser, userId);
    if (!profile || profile === null) {
      throw new Error("Profile not found");
    }
    return profile;
  }

  async updateProfile(
    loggedUser: LoggedUser,
    profileData: Partial<Profile>
  ): Promise<Profile> {
    return this.httpProfileService.updateProfile(loggedUser, profileData);
  }

  async getOnboardingCurrentStep(loggedUser: LoggedUser): Promise<number> {
    return this.httpProfileService.getOnboardingCurrentStep(loggedUser);
  }

  async getOnboardingNextStep(loggedUser: LoggedUser): Promise<number> {
    return this.httpProfileService.getOnboardingNextStep(loggedUser);
  }

  async findForLoggedUser(loggedUser: LoggedUser): Promise<Profile | null> {
    return this.httpProfileService.findProfileByLoggedUser(loggedUser);
  }
}
