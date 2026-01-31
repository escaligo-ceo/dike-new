import {
  AppLogger,
  inspect,
  Profile,
  Token,
} from "@dike/common";
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ProfileService } from "../profile/profile.service";
import { LoggedUser } from "@dike/communication";
import { log } from "console";

@Injectable()
export class OnboardingService {
  constructor(
    private readonly logger: AppLogger,
    private readonly profileService: ProfileService
  ) {
    this.logger = new AppLogger(OnboardingService.name);
  }

  async getCurrentStep(loggedUser: LoggedUser): Promise<number> {
    const userId = loggedUser.id;
    if (!userId) {
      throw new NotFoundException(
        "[getCurrentStep] Invalid token: userId not found"
      );
    }
    const profile: Profile | null = await this.profileService.findByUserId(
      loggedUser,
      userId
    );
    if (!profile || profile == null) {
      throw new HttpException(
        "[getCurrentStep]: Profile not found",
        HttpStatus.NOT_FOUND
      );
    }
    this.logger.debug(`getCurrentStep: ${inspect(profile)}`);
    const { lastCompletedOnBoardingStep } = profile;
    return !lastCompletedOnBoardingStep || lastCompletedOnBoardingStep === null
      ? 1
      : lastCompletedOnBoardingStep;
  }

  async getNextStep(loggedUser: LoggedUser, step?: number): Promise<number> {
    // const currentStep =
    //   step || (await this.profileService.getOnboardingCurrentStep(loggedUser));
    const nextStep = await this.profileService.getOnboardingNextStep(loggedUser);
    const profile: Profile | null = await this.profileService.findForLoggedUser(loggedUser);
    if (!profile || profile === null) {
      console.trace();
      throw new NotFoundException("[getNextStep]: Profilo non trovato");
    }
    return nextStep;
  }

  // async isStepAllowed(tokenDto: Token, step: number): Promise<boolean> {
  //   try {
  //     const res: boolean = await this.profileService.isStepAllowed(
  //       tokenDto,
  //       step
  //     );
  //     this.logger.debug(`isStepAllowed ${step}: ${inspect(res)}`);
  //     return res;
  //   } catch (error) {
  //     this.logger.error(
  //       `Error in isStepAllowed while fetching profile: ${inspect(error)}`
  //     );
  //     throw error;
  //   }
  //   // return this.profileService.isStepAllowed(tokenDto, step);;
  // }

  async goToNextStep(loggedUser: LoggedUser): Promise<void> {
    try {
      const nextStep =
        await this.profileService.getOnboardingNextStep(loggedUser);
      this.logger.debug(`Advancing to next step: ${nextStep}`);
      this.logger.warn(`goToNextStep > Token: ${inspect(loggedUser)}`);
      await this.profileService.updateProfile(loggedUser, {
        lastCompletedOnBoardingStep: nextStep,
      });
    } catch (error) {
      this.logger.error(
        `Error in goToNextStep while updating profile: ${inspect(error)}`
      );
      throw error;
    }
  }

  async postCompleteProfile(loggedUser: LoggedUser, body: any): Promise<void> {
    const jobRoleId = body.jobRoleId;
    const companyName = body.companyName;
    const companySize = body.companySize;
    const phoneNumber = body.phoneNumber;
    const profileData: Partial<Profile> = {
      // jobRoleId,
      // companyName,
      // companySize,
      phoneNumber,
    };
    this.logger.debug(`postCompleteProfile with data: ${inspect(profileData)}`);
    // await this.profileService.updateProfile(loggedUser, profileData);
    this.logger.debug(
      `Profile updated, now advancing to next step: ${inspect(loggedUser)}`
    );
    // await this.goToNextStep(loggedUser);
  }

  async postStep2(loggedUser: LoggedUser, body: any): Promise<void> {
    const profileData: Partial<Profile> = {
      // Add fields to update for step 2
    };
    this.logger.debug(`postStep2 with data: ${inspect(profileData)}`);
    // await this.profileService.updateProfile(loggedUser, profileData);
    await this.goToNextStep(loggedUser);
  }

  async postSubscribePlan(loggedUser: LoggedUser, body: any): Promise<void> {
    const plan = body.plan;
    const profileData: Partial<Profile> = {
      // plan,
    };
    this.logger.debug(`postSubscribePlan with data: ${inspect(profileData)}`);
    // await this.profileService.updateProfile(loggedUser, profileData);
    await this.goToNextStep(loggedUser);
  }

  async postOffice(loggedUser: LoggedUser, body: any): Promise<void> {
    const office = body.office;
    const profileData: Partial<Profile> = {
      // office,
    };
    this.logger.debug(`postOffice with data: ${inspect(profileData)}`);
    // await this.profileService.updateProfile(loggedUser, profileData);
    await this.goToNextStep(loggedUser);
  }

  async postTeam(loggedUser: LoggedUser, body: any): Promise<void> {
    const team = body.team;
    const profileData: Partial<Profile> = {
      // team,
    };
    this.logger.debug(`postTeam with data: ${inspect(profileData)}`);
    // await this.profileService.updateProfile(loggedUser, profileData);
    await this.goToNextStep(loggedUser);
  }

  async postStep6(loggedUser: LoggedUser, body: any): Promise<void> {
    const profileData: Partial<Profile> = {
      // Add fields to update for step 6
    };
    this.logger.debug(`postStep6 with data: ${inspect(profileData)}`);
    // await this.profileService.updateProfile(loggedUser, profileData);
    await this.goToNextStep(loggedUser);
  }

  async postStep7(loggedUser: LoggedUser, body: any): Promise<void> {
    const profileData: Partial<Profile> = {
      // Add fields to update for step 7
    };
    this.logger.debug(`postStep7 with data: ${inspect(profileData)}`);
    // await this.profileService.updateProfile(loggedUser, profileData);
    await this.goToNextStep(loggedUser);
  }
}
