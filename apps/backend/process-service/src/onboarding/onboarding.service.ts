import {
  AccessAction,
  AccessResponse,
  AccessStep,
  AccessStepStatus,
  Actions,
  FullAccessTokenDto,
  IOnboardingResponse,
  Onboarding,
  OnboardingStep,
  Tenant,
} from "@dike/common";
import { LoggedUser } from "@dike/communication";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HttpAuthService } from "../communication/http.auth.service";
import { HttpTenantService } from "../communication/http.tenant.service";
import { OfficeStepService } from "./steps/create-office.step";
import { SubscriptionStepService } from "./steps/create-subscription.step";
import { TeamStepService } from "./steps/create-team.step";
import { TenantStepService } from "./steps/create-tenant.step";

@Injectable()
export class OnboardingService {
  constructor(
    private readonly tenantStep: TenantStepService,
    private readonly subscriptionStep: SubscriptionStepService,
    private readonly teamStep: TeamStepService,
    private readonly officeStep: OfficeStepService,
    @InjectRepository(Onboarding)
    private readonly onboardingRepository: Repository<Onboarding>,
    private readonly httpTenantService: HttpTenantService,
    private readonly httpAuthService: HttpAuthService,
  ) {}

  async stepOnboarding(
    loggedUser: LoggedUser,
    data: any,
  ): Promise<AccessResponse> {
    const userId = loggedUser.id;
    const onboarding = await this.findByUserId(loggedUser);
    if (!onboarding)
      throw new Error(`Onboarding not found for userId: ${userId}`);

    let onboardingResponse: IOnboardingResponse;
    switch (onboarding.currentStep) {
      case OnboardingStep.STARTED:
        onboardingResponse = await this.tenantStep.execute(loggedUser, data);
      case OnboardingStep.PROFILE_CREATION:
        onboardingResponse = await this.tenantStep.execute(loggedUser, data);
      case OnboardingStep.TENANT_CREATION:
        onboardingResponse = await this.tenantStep.execute(loggedUser, data);
      case OnboardingStep.ASSIGN_SUBSCRIPTION:
        onboardingResponse = await this.subscriptionStep.execute(
          loggedUser,
          data,
        );
      case OnboardingStep.TEAM_CREATION:
        onboardingResponse = await this.teamStep.execute(loggedUser, data);
      case OnboardingStep.OFFICE_CREATION:
        onboardingResponse = await this.officeStep.execute(loggedUser, data);
      case OnboardingStep.COMPLETED:
        onboardingResponse = {
          userId,
          currentStep: OnboardingStep.COMPLETED,
          nextStep: null,
          requiredFields: undefined,
          action: Actions.NONE,
          reason: null,
        };
      default:
        // throw new Error(`Unknown onboarding step: ${onboarding.currentStep}`);
        onboardingResponse = {
          userId,
          currentStep: OnboardingStep.NOT_STARTED,
          nextStep: OnboardingStep.STARTED,
          requiredFields: undefined,
          action: Actions.START,
          reason: null,
        };
    }

    return {
      step: AccessStep.ONBOARDING,
      stepStatus:
        onboardingResponse.currentStep === OnboardingStep.COMPLETED
          ? AccessStepStatus.COMPLETED
          : AccessStepStatus.PENDING,
      nextAction:
        onboardingResponse.currentStep === OnboardingStep.COMPLETED
          ? AccessAction.ACCESS_APP
          : AccessAction.CONTINUE_ONBOARDING,
      context: onboardingResponse,
    };
  }

  async startOnboarding(loggedUser: LoggedUser): Promise<IOnboardingResponse> {
    const userId = loggedUser.id;
    const existingOnboarding = await this.findByUserId(loggedUser);
    if (existingOnboarding) {
      return {
        userId,
        currentStep:
          existingOnboarding.currentStep as IOnboardingResponse["currentStep"],
        nextStep: this.getNextOnboardingStep(
          existingOnboarding.currentStep as IOnboardingResponse["currentStep"],
        ),
        requiredFields: undefined,
        action:
          existingOnboarding.currentStep === OnboardingStep.COMPLETED
            ? Actions.NONE
            : Actions.CONTINUE,
        reason: null,
      };
    }

    const newOnboarding = this.onboardingRepository.create({
      userId,
      step: OnboardingStep.STARTED,
    });
    await this.onboardingRepository.save(newOnboarding);

    return {
      userId,
      currentStep: OnboardingStep.STARTED,
      nextStep: OnboardingStep.PROFILE_CREATION,
      requiredFields: undefined,
      action: Actions.CONTINUE,
      reason: null,
    };
  }

  async completeOnboarding(loggedUser: LoggedUser): Promise<AccessResponse> {
    const userId = loggedUser.id;
    const onboarding = await this.onboardingRepository.findOne({
      where: { userId },
    });
    if (!onboarding) {
      throw new Error(`Onboarding not found for userId: ${userId}`);
    }

    // required steps to complete onboarding
    const requiredSteps = [
      OnboardingStep.OFFICE_CREATION,
      OnboardingStep.TEAM_CREATION,
      OnboardingStep.TENANT_CREATION,
      OnboardingStep.ASSIGN_SUBSCRIPTION,
      OnboardingStep.PROFILE_CREATION,
      OnboardingStep.STARTED,
    ];

    // controllo quali step mancano
    const missingSteps = requiredSteps.filter(
      (step) => !onboarding.completedSteps.includes(step),
    );

    if (missingSteps.length > 0) {
      // non posso completare l'onboarding
      return {
        step: AccessStep.ONBOARDING,
        stepStatus: AccessStepStatus.PENDING,
        nextAction: AccessAction.CONTINUE_ONBOARDING,
        message: `Alcuni step non sono completati: ${missingSteps.join(", ")}`,
        context: {
          currentStep: missingSteps[0],
          completedSteps: onboarding.completedSteps,
        },
        token: {
          type: "LIMITED",
          value: loggedUser.token.accessToken,
        },
      };
    }

    // tutti gli step completati → aggiorno stato
    onboarding.step = OnboardingStep.COMPLETED;
    onboarding.completedSteps = requiredSteps;
    onboarding.error = undefined;
    await this.onboardingRepository.save(onboarding);

    const payload: FullAccessTokenDto = {
      kc_access_token: loggedUser.token.accessToken,
      tenantId: onboarding.tenantId as string,
      profileId: loggedUser.id,
    };
    // rilascia token FULL
    return {
      step: AccessStep.READY,
      stepStatus: AccessStepStatus.COMPLETED,
      nextAction: AccessAction.ACCESS_APP,
      message: "Onboarding completato",
      token: {
        type: "FULL",
        value: await this.httpAuthService.generateFullAccessToken(
          loggedUser,
          payload,
        ),
      },
    };
  }

  async getTenantIdByUserId(userId: string): Promise<string | undefined> {
    const onboarding = await this.onboardingRepository.findOne({
      where: { userId },
    });
    if (!onboarding) return undefined;

    return onboarding?.tenantId;
  }

  async getTenantByUserId(
    loggedUser: LoggedUser,
    userId: string,
  ): Promise<Tenant | null> {
    const tenantId = await this.getTenantIdByUserId(userId);
    if (!tenantId) {
      throw new Error(`Tenant not found for userId: ${userId}`);
    }
    return this.httpTenantService.getTenant(loggedUser, tenantId);
  }

  async findByUserId(loggedUser: LoggedUser): Promise<IOnboardingResponse> {
    const onboarding = await this.onboardingRepository.findOne({
      where: { userId: loggedUser.id },
    });

    if (!onboarding) {
      return {
        userId: loggedUser.id,
        currentStep: OnboardingStep.NOT_STARTED,
        nextStep: OnboardingStep.STARTED,
        requiredFields: undefined,
        action: Actions.START,
        reason: null,
        completedSteps: [],
      };
    }

    return {
      userId: loggedUser.id,
      currentStep: onboarding.step as IOnboardingResponse["currentStep"],
      nextStep: this.getNextOnboardingStep(
        onboarding.step as IOnboardingResponse["currentStep"],
      ),
      requiredFields: this.getOnboardingRequiredFieldsAtStep(
        onboarding.step as OnboardingStep,
      ),
      action:
        onboarding.step === OnboardingStep.COMPLETED
          ? Actions.NONE
          : Actions.CONTINUE,
      reason: null,
      completedSteps: onboarding.completedSteps || [],
    };
  }

  private getNextOnboardingStep(
    status: IOnboardingResponse["currentStep"] | null,
  ): OnboardingStep | null {
    switch (status) {
      case OnboardingStep.NOT_STARTED:
        return OnboardingStep.STARTED;
      case OnboardingStep.STARTED:
        return OnboardingStep.PROFILE_CREATION;
      case OnboardingStep.PROFILE_CREATION:
        return OnboardingStep.TENANT_CREATION;
      case OnboardingStep.TENANT_CREATION:
        return OnboardingStep.ASSIGN_SUBSCRIPTION;
      case OnboardingStep.ASSIGN_SUBSCRIPTION:
        return OnboardingStep.TEAM_CREATION;
      case OnboardingStep.TEAM_CREATION:
        return OnboardingStep.OFFICE_CREATION;
      case OnboardingStep.OFFICE_CREATION:
        return OnboardingStep.COMPLETED;
      case OnboardingStep.COMPLETED:
        return null;
      default:
        throw new Error(`Invalid onboarding status: ${status}`);
    }
  }

  getOnboardingRequiredFieldsAtStep(currentStep: OnboardingStep): string[] {
    switch (currentStep) {
      case OnboardingStep.NOT_STARTED:
        return ["start"];
      case OnboardingStep.STARTED:
        return ["profile"];
      case OnboardingStep.PROFILE_CREATION:
        return ["tenant"];
      case OnboardingStep.TENANT_CREATION:
        return ["subscription"];
      case OnboardingStep.ASSIGN_SUBSCRIPTION:
        return ["team"];
      case OnboardingStep.TEAM_CREATION:
        return ["office"];
      case OnboardingStep.OFFICE_CREATION:
        return [];
      case OnboardingStep.COMPLETED:
        return [];
      default:
        throw new Error(`Invalid onboarding step: ${currentStep}`);
    }
  }
}
