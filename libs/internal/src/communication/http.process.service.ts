import {
  Actions,
  AppLogger,
  DikeConfigService,
  IOnboardingResponse,
  Onboarding,
  OnboardingStep,
  OriginDto,
} from "@dike/common";
import { BaseHttpService } from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HttpProfileService } from "./http.profile.service.js";
import { HttpSubscriptionService } from "./http.subscription.service.js";
import { HttpTenantService } from "./http.tenant.service.js";

export class HttpProcessService extends BaseHttpService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    private readonly httpProfileService: HttpProfileService,
    private readonly httpTenantService: HttpTenantService,
    private readonly httpSubscriptionService: HttpSubscriptionService,
    @InjectRepository(Onboarding)
    public onboardingRepository: Repository<Onboarding>
  ) {
    super(
      httpService,
      new AppLogger(HttpProcessService.name),
      configService,
      configService.env("PROCESS_SERVICE_URL", "http://localhost:3001/api")
    );
  }

  async findByUserId(userId: string): Promise<Onboarding | null> {
    return this.onboardingRepository.findOne({ where: { userId } });
  }

  async startOnboarding(
    originDto: OriginDto,
    userId: string
  ): Promise<IOnboardingResponse> {
    const onboarding = await this.findByUserId(userId);
    if (onboarding) {
      return {
        userId,
        currentStep: onboarding.step as IOnboardingResponse["currentStep"],
        nextStep: "STARTED" as IOnboardingResponse["nextStep"],
        requiredFields: undefined,
        action:
          onboarding.step === "COMPLETED" ? Actions.NONE : Actions.CONTINUE,
        reason: null,
      };
    }
    const instance = this.onboardingRepository.create({
      userId,
    });
    const onboarded = await this.onboardingRepository.save(instance);
    return {
      userId,
      currentStep: OnboardingStep.STARTED,
      nextStep: OnboardingStep.PROFILE_CREATION,
      requiredFields: undefined,
      action: Actions.CONTINUE,
      reason: null,
    };
  }

  async stepOnboarding(
    originDto: OriginDto,
    userId: string
  ): Promise<IOnboardingResponse> {
    const onboarding = await this.findByUserId(userId);
    if (!onboarding) {
      throw new Error(`Onboarding not found for userId: ${userId}`);
    }

    switch (onboarding.step) {
      case OnboardingStep.STARTED:
        return this.internalFindOrCreateProfile(originDto, userId);
      case OnboardingStep.PROFILE_CREATION:
        return this.internalFindOrCreateTenant(originDto, userId);
      case OnboardingStep.TENANT_CREATION:
        return this.internalSubscribePlanOnTenant(originDto, userId);
      case OnboardingStep.ASSIGN_SUBSCRIPTION:
        return this.completeOnboarding(originDto, userId);
      default:
        throw new Error(
          `Invalid onboarding step: ${onboarding.step} for userId: ${userId}`
        );
    }
  }

  private async internalFindOrCreateProfile(
    originDto: OriginDto,
    userId: string
  ): Promise<IOnboardingResponse> {
    // Call Profile Service to create profile
    const profileResponse =
      await this.httpProfileService.internalFindOrCreateProfile(
        originDto,
        userId
      );

    // Update onboarding status
    const onboarding = await this.findByUserId(userId);
    if (!onboarding) {
      throw new Error(`Onboarding not found for userId: ${userId}`);
    }
    await this.onboardingRepository.save(onboarding);

    return {
      userId,
      currentStep: "PROFILE_CREATION" as IOnboardingResponse["currentStep"],
      nextStep: "TENANT_CREATION" as IOnboardingResponse["nextStep"],
      requiredFields: undefined,
      action: Actions.CONTINUE,
      reason: null,
    };
  }

  private async internalFindOrCreateTenant(
    originDto: OriginDto,
    userId: string
  ): Promise<IOnboardingResponse> {
    // Call Tenant Service to create tenant
    const tenantResponse =
      await this.httpTenantService.internalFindOrCreateTenant(
        originDto,
        userId
      );

    // Update onboarding status
    const onboarding = await this.findByUserId(userId);
    if (!onboarding) {
      throw new Error(`Onboarding not found for userId: ${userId}`);
    }

    await this.onboardingRepository.save(onboarding);

    return {
      userId,
      currentStep: "TENANT_CREATION" as IOnboardingResponse["currentStep"],
      nextStep: "ASSIGN_SUBSCRIPTION" as IOnboardingResponse["nextStep"],
      requiredFields: undefined,
      action: Actions.CONTINUE,
      reason: null,
    };
  }

  private async internalSubscribePlanOnTenant(
    originDto: OriginDto,
    userId: string
  ): Promise<IOnboardingResponse> {
    // Call Subscription Service to assign subscription
    const subscriptionResponse =
      await this.httpSubscriptionService.internalSubscribePlanOnTenant(
        originDto,
        userId
      );

    // Update onboarding status
    const onboarding = await this.findByUserId(userId);
    if (!onboarding) {
      throw new Error(`Onboarding not found for userId: ${userId}`);
    }

    await this.onboardingRepository.save(onboarding);

    return {
      userId,
      currentStep: "SUBSCRIPTION_ASSIGNED" as IOnboardingResponse["currentStep"],
      nextStep: "COMPLETED" as IOnboardingResponse["nextStep"],
      requiredFields: undefined,
      action: Actions.CONTINUE,
      reason: null,
    };
  }

  private async completeOnboarding(
    originDto: OriginDto,
    userId: string
  ): Promise<IOnboardingResponse> {
    // Update onboarding status
    const onboarding = await this.findByUserId(userId);
    if (!onboarding) {
      throw new Error(`Onboarding not found for userId: ${userId}`);
    }

    await this.onboardingRepository.save(onboarding);

    return {
      userId,
      currentStep: "COMPLETED" as IOnboardingResponse["currentStep"],
      nextStep: null,
      requiredFields: undefined,
      action: Actions.NONE,
      reason: null,
    };
  }

  private async failOnboarding(
    originDto: OriginDto,
    userId: string
  ): Promise<IOnboardingResponse> {
    // Update onboarding status
    const onboarding = await this.findByUserId(userId);
    if (!onboarding) {
      throw new Error(`Onboarding not found for userId: ${userId}`);
    }

    await this.onboardingRepository.save(onboarding);

    return {
      userId,
      currentStep: null,
      nextStep: null,
      requiredFields: undefined,
      action: Actions.NONE,
      reason: null,
    };
  }

  async getOnboardingForUser(
    originDto: OriginDto,
    userId: string
  ): Promise<IOnboardingResponse> {
    const onboarding = await this.findByUserId(userId);
    if (!onboarding) {
      return {
        userId,
        currentStep: null,
        nextStep: null,
        requiredFields: undefined,
        action: Actions.START,
        reason: null,
      };
    }

    return {
      userId,
      currentStep:
        onboarding.step === "COMPLETED"
          ? ("COMPLETED" as IOnboardingResponse["currentStep"])
          : (this.getNextOnboardingStep(
              onboarding.step
            ) as IOnboardingResponse["currentStep"]),
      nextStep:
        onboarding.step === "COMPLETED"
          ? null
          : (this.getNextOnboardingStep(
              onboarding.step
            ) as IOnboardingResponse["nextStep"]),
      requiredFields: undefined,
      action: onboarding.step === "COMPLETED" ? Actions.NONE : Actions.CONTINUE,
      reason: null,
    };
  }

  private getNextOnboardingStep(
    step: IOnboardingResponse["currentStep"] | null
  ): OnboardingStep | null {
    switch (step) {
      case OnboardingStep.NOT_STARTED:
        return OnboardingStep.STARTED;
      case OnboardingStep.STARTED:
        return OnboardingStep.PROFILE_CREATION;
      case OnboardingStep.PROFILE_CREATION:
        return OnboardingStep.TENANT_CREATION;
      case OnboardingStep.TENANT_CREATION:
        return OnboardingStep.ASSIGN_SUBSCRIPTION;
      case OnboardingStep.ASSIGN_SUBSCRIPTION:
        return OnboardingStep.COMPLETED;
      case OnboardingStep.COMPLETED:
        return null;
      default:
        throw new Error(`Invalid onboarding step: ${step}`);
    }
  }
}
