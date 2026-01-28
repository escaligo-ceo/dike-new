import {
  Actions,
  AppLogger,
  DikeConfigService,
  IOnboardingResponse,
  IStep,
  OnboardingStep,
  OriginDto,
} from "@dike/common";
import { BaseHttpService, LoggedUser } from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { OnboardingService } from "../onboarding.service";

@Injectable()
export class OfficeStepService extends BaseHttpService implements IStep {
  step = OnboardingStep.OFFICE_CREATION;
  nextStep = OnboardingStep.COMPLETED;

  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    @Inject(forwardRef(() => OnboardingService))
    private readonly onboardingService: OnboardingService,
  ) {
    super(
      httpService,
      new AppLogger(OfficeStepService.name),
      configService,
      configService.env("TENANT_SERVICE_URL", "http://localhost:8005/api")
    );
  }

  async execute(
    loggedUser: LoggedUser,
    data: any,
  ): Promise<IOnboardingResponse> {
    // 1️⃣ Ricarico lo stato dal DB
    const onboarding = await this.onboardingService.findByUserId(loggedUser);
    if (!onboarding) throw new Error('Onboarding non trovato');

    const requiredFields = await this.validateOffice(loggedUser);

    const completedSteps = onboarding.completedSteps || [];
    completedSteps.push(this.step);
    return {
      userId: loggedUser.id,
      currentStep: this.step,
      nextStep: requiredFields.length > 0 ? this.step : this.nextStep,
      requiredFields,
      action: requiredFields.length > 0 ? Actions.CONTINUE : Actions.NONE,
      reason: null,
      completedSteps,
    };
  }

  private async validateOffice(
    loggedUser: LoggedUser, 
  ): Promise<string[]> {
    const office = await this.getOffice(loggedUser);
    return office?.exists ? [] : ["office"];
  }

  async getOffice(
    loggedUser: LoggedUser,
  ): Promise<{ exists: boolean }> {
    const res = await this.get("v1/offices", loggedUser.token.originDto);
    const office = res.data;
    if (!office) {
      return { exists: false };
    }
    return {
      exists: !!office,
    };
  }
}
