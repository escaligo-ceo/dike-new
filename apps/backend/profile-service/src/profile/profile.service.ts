import { AppLogger, inspect, OriginDto, Profile } from "@dike/common";
import {
  ApiGatewayService,
  AuditService,
  LoggedUser,
} from "@dike/communication";
import { FindOrCreateProfileRequest, FindOrCreateProfileResponse } from "@dike/contracts/src/profile/profile-internal.dto";
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import fs from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import { Repository } from "typeorm";
import { UploadAvatarResult } from "./profile.result";

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    public profileRepository: Repository<Profile>,
    private readonly logger: AppLogger,
    private readonly auditService: AuditService,
    private readonly apiGateway: ApiGatewayService
  ) {
    this.logger = new AppLogger(ProfileService.name);
  }

  async findByUserId(
    loggedUser: LoggedUser,
  ): Promise<Profile | null> {
    return this.profileRepository.findOne({
      where: { userId: loggedUser.id },
    });
  }

  async internalFindByUserId(
    loggedUser: LoggedUser
  ): Promise<Profile | null> {
    return this.profileRepository.findOne({
      where: { userId: loggedUser.id },
    });
  }

  async findForLoggedUser(loggedUser: LoggedUser): Promise<Profile> {
    this.logger.log(
      `Finding profile for loddeg user: ${inspect(loggedUser.token.accessToken)}`
    );
    const res = await this.findByUserId(loggedUser);
    if (!res) {
      throw new NotFoundException("Unable to find profile");
    }
    return res;
  }

  async findInRepository(loggedUser: LoggedUser): Promise<Profile[]> {
    return this.profileRepository.find();
  }

  async updateTeamSettings(): Promise<any> {
    throw new Error("Method not implemented.");
  }

  async updateProfileByToken(
    loggedUser: LoggedUser,
    ...profileData
  ): Promise<Profile> {
    const tokenDto = loggedUser.getToken();
    const profile: Profile = await this.findForLoggedUser(loggedUser);

    // Gestione jobRoleText: obbligatorio se CUSTOM, descrizione standard altrimenti
    // if (typeof profileData.jobRole === 'number') {
    //   if (profileData.jobRole === JobRole.CUSTOM) {
    //     if (!profileData.jobRoleText || profileData.jobRoleText.trim() === '') {
    //       throw new HttpException('jobRoleText è obbligatorio quando jobRole è CUSTOM', HttpStatus.BAD_REQUEST);
    //     }
    //   // } else {
    //   //   // Mappa codice numerico a descrizione standard
    //   //   const jobRoleLabels = {
    //   //     [JobRole.LAWYER]: 'Lawyer',
    //   //     [JobRole.PRATICANTE]: 'Praticante',
    //   //     [JobRole.ASSISTENTE]: 'Assistente',
    //   //     [JobRole.ADMIN]: 'Amministratore di Sistema',
    //   //   };
    //   //   updateDto.jobRoleText = jobRoleLabels[profileData.jobRole] || null;
    //   }
    // }

    Object.assign(profile, profileData);
    const response = await this.profileRepository.save(profile);

    this.auditService.safeLog(
      loggedUser,
      "PROFILE_UPDATE",
      `Profile updated for userId: ${loggedUser.id}`,
      { userId: profile.userId }
    );

    return response;
  }

  async updateProfileByUserId(
    loggedUser: LoggedUser,
    userId: string,
    body: FindOrCreateProfileRequest
  ): Promise<Profile> {
    const profile: Profile | null = await this.findByUserId(loggedUser);
    if (!profile || profile === null) {
      throw new Error("Profile not found");
    }

    Object.assign(profile, body.profileData);
    const response = await this.profileRepository.save(profile);

    return response;
  }

  async findOrCreate(
    loggedUser: LoggedUser,
    body: FindOrCreateProfileRequest
  ): Promise<FindOrCreateProfileResponse> {
    this.logger.debug(
      `Finding or creating profile for userId: ${loggedUser.id}, profileData: ${inspect(body.profileData)}`
    );
    let userId: string;

    try {
      userId = body.profileData.userId || loggedUser.id;
    } catch (error) {
      this.logger.error(`Failed to extract userId: ${inspect(error)}`);
      throw new HttpException(
        "Unable to extract userId from token",
        HttpStatus.BAD_REQUEST
      );
    }

    let profile = await this.findByUserId(loggedUser);
    if (profile === null) {
      this.logger.log(`Creating new profile for userId: ${userId}`);
      const profileEntity = this.profileRepository.create({
        userId,
        ...body.profileData,
      });
      profile = await this.profileRepository.save(profileEntity);

      this.auditService.safeLog(
        loggedUser,
        "PROFILE_FIND_OR_CREATE",
        `Profile created for userId: ${userId}`,
        { userId: profile.userId }
      );

      this.logger.log(`Profile created: ${inspect(profile)}`);
      return [profile, true];
    }
    this.auditService.safeLog(
      loggedUser,
      "PROFILE_FIND_OR_CREATE",
      `Profile found for userId: ${userId}`,
      { userId: profile.userId }
    );

    this.logger.log(`Profile found: ${inspect(profile)}`);
    return [profile, false];
  }

  async internalFindOrCreate(
    loggedUser: LoggedUser,
  ): Promise<FindOrCreateProfileResponse> {
    let profile = await this.internalFindByUserId(loggedUser);
    if (profile === null) {
      this.logger.log(`Creating new profile for userId: ${loggedUser.id}`);
      const profileEntity = this.profileRepository.create({
        userId: loggedUser.id,
      });
      profile = await this.profileRepository.save(profileEntity);

      this.auditService.safeLog(
        loggedUser,
        "PROFILE_FIND_OR_CREATE",
        `Profile created for userId: ${loggedUser.id}`,
        { userId: profile.userId }
      );

      this.logger.log(`Profile created: ${inspect(profile)}`);
      return [profile, true];
    }
    this.auditService.safeLog(
      loggedUser,
      "PROFILE_FIND_OR_CREATE",
      `Profile found for userId: ${loggedUser.id}`,
      { userId: profile.userId }
    );

    this.logger.log(`Profile found: ${inspect(profile)}`);
    return [profile, false];
  }

  async uploadAvatar(
    loggedUser: LoggedUser,
    file: any
  ): Promise<UploadAvatarResult> {
    const filePath = join("./uploads/avatars", file.filename);
    const resizedPath = join("./uploads/avatars", `resized-${file.filename}`);

    // Ridimensiona a 256x256 px
    await sharp(filePath).resize(256, 256).toFile(resizedPath);

    // Elimina il file originale se vuoi conservare solo la versione ridimensionata
    await fs.unlink(filePath);

    const profile: Profile = await this.findForLoggedUser(loggedUser);
    const url = `/uploads/avatars/resized-${file.filename}`;
    profile.avatarUrl = url;
    this.profileRepository.save(profile);

    return {
      message: "Avatar caricato con successo",
      filename: `resized-${file.filename}`,
      url: `/uploads/avatars/resized-${file.filename}`,
    };
  }

  // async isStepAllowed(loggedUser: LoggedUser, step: number): Promise<boolean> {
  //   const currentStep = await this.getOnboardingCurrentStep(tokenDto);
  //   const res = step <= currentStep + 1;
  //   if (!res) {
  //     const userId = userIdFromToken(tokenDto.token);
  //     this.logger.error(
  //       `Onboarding step ${step} not allowed. Current step is ${currentStep} for user: ${userId}`
  //     );
  //   }
  //   return res;
  // }

  async getOnboardingCurrentStep(loggedUser: LoggedUser): Promise<number> {
    const profile: Profile = await this.findForLoggedUser(loggedUser);
    const lastCompletedOnBoardingStep = profile.lastCompletedOnBoardingStep;
    return !lastCompletedOnBoardingStep || lastCompletedOnBoardingStep === null
      ? 1
      : lastCompletedOnBoardingStep;
  }

  async getOnboardingNextStep(loggedUser: LoggedUser): Promise<number> {
    const currentStep = await this.getOnboardingCurrentStep(loggedUser);
    return currentStep + 1;
  }

  async getProfileSettings(loggedUser: LoggedUser): Promise<Profile> {
    const profile: Profile = await this.findForLoggedUser(loggedUser);
    return profile;
  }

  async updateProfileSettings(
    loggedUser: LoggedUser,
    body: FindOrCreateProfileRequest
  ): Promise<Profile> {
    const profile: Profile = await this.findForLoggedUser(loggedUser);
    Object.assign(profile, body.profileData);
    const response = await this.profileRepository.save(profile);

    return response;
  }
}
