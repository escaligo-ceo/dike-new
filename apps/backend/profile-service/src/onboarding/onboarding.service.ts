import {
  Actions,
  AppLogger,
  IOnboardingResponse,
  OnboardingPages,
  OnboardingStep,
  pageToStep,
  Profile,
  Token,
  userIdFromToken,
} from "@dike/common";
import { LoggedUser } from "@dike/communication";
import { FindOrCreateProfileRequest } from "@dike/contracts";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProfileService } from "../profile/profile.service";

@Injectable()
export class OnboardingService {
  constructor(
    private readonly logger: AppLogger,
    private readonly profileService: ProfileService,
    @InjectRepository(Profile)
    public userProfileRepository: Repository<Profile>
  ) {
    this.logger = new AppLogger(OnboardingService.name);
  }

  async getOnboardingStep(
    loggedUser: LoggedUser,
    page: OnboardingPages,
  ): Promise<IOnboardingResponse> {
    const userId = loggedUser.id;
    const tokenDto: Token = loggedUser.getToken();
    if (!userId) {
      throw new Error("[getOnboardingStep] Invalid token: userId not found");
    }
    this.logger.log(
      `Getting onboarding step for user ${userId} on page ${page}`
    );
    const step = pageToStep(page);
    // Decode token to extract optional username and email for initial profile creation
    const jwtService = new JwtService();
    const payload: any = jwtService.decode(tokenDto.accessToken) || {};
    const username: string | undefined = payload?.preferred_username || payload?.username;
    const email: string | undefined = payload?.email;

    if (!username && !email) {
      throw new HttpException(
        "At least one of username or email must be provided",
        HttpStatus.BAD_REQUEST
      );
    }

    const body: FindOrCreateProfileRequest = {
      profileData: {
        userId,
        email,
      },
    };

    const [profile] = await this.profileService.findOrCreate(loggedUser, body);
    if (!profile) {
      this.logger.warn(
        `No profile found for userId: ${userId} in getOnboardingStep`
      );
      throw new Error(
        `No profile found for userId: ${userId} in getOnboardingStep`
      );
    }
    profile.lastCompletedOnBoardingStep =
      profile.lastCompletedOnBoardingStep === undefined ||
      profile.lastCompletedOnBoardingStep === null
        ? 1
        : profile.lastCompletedOnBoardingStep;
    this.logger.debug(
      `User ${userId} current onboarding step: ${profile?.lastCompletedOnBoardingStep}`
    );
    if (!profile) {
      this.logger.warn(
        `No profile found for userId: ${userId} in getOnboardingStep`
      );
      throw new Error(
        `No profile found for userId: ${userId} in getOnboardingStep`
      );
    }
    if (page > profile.lastCompletedOnBoardingStep + 1) {
      this.logger.warn(
        `User ${userId} tried to access step ${step} but current step is ${profile.lastCompletedOnBoardingStep}`
      );
      throw new Error("Accesso non autorizzato a questo passo di onboarding.");
    }
    if (
      !(
        step > OnboardingStep.NOT_STARTED &&
        step < OnboardingStep.STARTED &&
        page < OnboardingPages.COMPLETED
      )
    ) {
      throw new Error("Invalid page number");
    }
    return {
      userId,
      currentStep:
        page === OnboardingPages.START
          ? null
          : pageToStep((page - 1) as OnboardingPages),
      nextStep:
        page < OnboardingPages.COMPLETED
          ? pageToStep((page + 1) as OnboardingPages)
          : null,
      requiredFields:
        page === OnboardingPages.USER_CREATION
          ? ["username", "password"]
          : page === OnboardingPages.PROFILE_CREATION
            ? ["firstName", "lastName", "email"]
            : page === OnboardingPages.TENANT_CREATION
              ? ["tenantName", "tenantDomain"]
              : page === OnboardingPages.SUBSCRIPTION_SELECTION
                ? ["tenantName", "tenantDomain"]
                : page === OnboardingPages.SEND_INVITATIONS
                  ? ["tenantName", "tenantDomain"]
                  : undefined,
      action:
        page < OnboardingPages.COMPLETED ? Actions.CONTINUE : Actions.NONE,
      reason: null,
    };
  }

  async postOnboardingStep(step: number, token: string): Promise<void> {
    const userId = userIdFromToken(token);
    this.logger.log(`Posting onboarding step for user ${userId}: ${step}`);
  }

  async onBoardingNextStep(
    loggedUser: LoggedUser,
  ): Promise<number> {
    const userId = userIdFromToken(loggedUser.id);
    if (!userId) {
      throw new Error("[onBoardingNextStep] Invalid token: userId not found");
    }
    const profile = await this.profileService.findByUserId(loggedUser);
    if (!profile || profile === null) {
      this.logger.warn(
        `[onBoardingNextStep] No profile found for userId: ${userId}`
      );
      throw new Error(
        `[onBoardingNextStep] No profile found for userId: ${userId}`
      );
    }
    if (
      profile.lastCompletedOnBoardingStep === null ||
      profile.lastCompletedOnBoardingStep === undefined
    ) {
      profile.lastCompletedOnBoardingStep = 1;
    } else {
      profile.lastCompletedOnBoardingStep += 1;
    }
    return profile.lastCompletedOnBoardingStep as number;
  }
}
