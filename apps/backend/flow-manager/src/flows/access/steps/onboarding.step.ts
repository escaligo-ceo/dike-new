import {
  AccessAction,
  AccessResponse,
  AccessStatus,
  AccessStep,
  AccessStepStatus,
  Actions,
  AppLogger,
  ILoginResult,
  IOnboardingResponse,
  LoginDto,
  OnboardingStep,
  StepResult,
} from "@dike/common";
import { LoggedUser, IStep, IBaseStep } from "@dike/communication";
import { Injectable } from "@nestjs/common";
import { HttpAuthService } from "../../../communication/http.auth.service";
import { OnboardingService } from "../../onboarding/onboarding.service";

@Injectable()
export class OnboardingStepService implements IBaseStep {
  step = AccessStep.ONBOARDING;
  nextStep = AccessStep.READY;
  protected readonly logger: AppLogger;

  constructor(
    private readonly _onboardingFlow: OnboardingService,
  ) {
    this.logger = new AppLogger(OnboardingStepService.name);
  }

  async execute(loginDto: LoginDto, loginResult: ILoginResult): Promise<AccessResponse> {
    const { userId } = loginDto;
    if (!userId) {
      throw new Error("userId is required in loginResult");
    }
    const onboardingCompleted = await this._onboardingFlow.isCompleted(userId); 

    if (!onboardingCompleted) {
      const onboardingResponse = await this._onboardingFlow.start(loginDto);
      return {
        step: AccessStep.ONBOARDING,
        status: AccessStatus.PENDING,
        stepStatus: AccessStepStatus.PENDING,
        nextAction: AccessAction.CONTINUE_ONBOARDING,
        message: "Onboarding started",
        token: {
          type: "LIMITED",
          value: loginResult.access_token,
        },
        context: onboardingResponse,
      };
    }

    return {
      step: AccessStep.EMAIL_VERIFICATION,
      status: AccessStatus.SUCCESS,
      stepStatus: AccessStepStatus.COMPLETED,
      nextAction: AccessAction.START_ONBOARDING,
      message: "Email successfully verified",
      token: {
        type: "LIMITED",
        value: loginResult.access_token,
      },
      refreshToken: loginResult.refresh_token,
      context: { emailVerified: true },
    };
  }
}
