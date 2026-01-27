import {
  AccessStep,
  Actions,
  AppLogger,
  IOnboardingResponse,
  OnboardingStep,
  StepResult,
} from "@dike/common";
import { LoggedUser, IStep } from "@dike/communication";
import { Injectable } from "@nestjs/common";
import { HttpAuthService } from "../../communication/http.auth.service";
import { OnboardingService } from "../../onboarding/onboarding.service";

@Injectable()
export class OnboardingStepService implements IStep {
  step = AccessStep.ONBOARDING;
  nextStep = AccessStep.READY;

  constructor(
    protected readonly logger: AppLogger,
    private readonly httpAuthService: HttpAuthService,
    private readonly onboardingService: OnboardingService,
    // protected readonly httpService: HttpService,
    // protected readonly configService: DikeConfigService,
  ) {
    this.logger = new AppLogger(OnboardingStepService.name);
  }

  async execute(
    loggedUser: LoggedUser,
  ): Promise<StepResult<IOnboardingResponse>> {
    const missingFields = await this.validateAuth(loggedUser);

    if (missingFields.length > 0) {
      const onboardingResponse: IOnboardingResponse = {
        userId: loggedUser.id,
        currentStep: OnboardingStep.NOT_STARTED,
        nextStep: OnboardingStep.NOT_STARTED,
        action: Actions.NONE,
        reason: "MISSING_FIELDS",
        missingFields,
      };
      return {
        step: this.step,
        status: Actions.BLOCKED,
        nextStep: AccessStep.ONBOARDING,
        reason: "ONBOARDING_INCOMPLETE",
        context: onboardingResponse,
      };
    }

    return {
      step: this.step,
      status: Actions.OK,
      nextStep: this.nextStep,
      context: await this.onboardingService.findByUserId(loggedUser),
    };
  }

  private async validateAuth(loggedUser: LoggedUser): Promise<string[]> {
    // esempio: ritorna campi mancanti
    const missing: string[] = [];
    const authInfo = await this.getAuthInfo(loggedUser);
    if (!authInfo.isAuthenticated) missing.push("isAuthenticated");
    return missing;
  }

  private async getAuthInfo(loggedUser: LoggedUser): Promise<any> {
    const url = `/v1/auth/${loggedUser.id}`;
    const response = await this.httpAuthService.get(
      url,
      loggedUser.token.originDto,
    );
    return response.data;
  }
}
