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
import { Injectable } from "@nestjs/common";
import { OnboardingService } from "../onboarding.service";

@Injectable()
export class ProfileStepService extends BaseHttpService implements IStep {
  step = OnboardingStep.PROFILE_CREATION;
  nextStep = OnboardingStep.TENANT_CREATION;

  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    private readonly onboardingService: OnboardingService,
  ) {
    super(
      httpService,
      new AppLogger(ProfileStepService.name),
      configService,
      configService.env("PROFILE_SERVICE_URL", "http://localhost:8002/api")
    );
  }

  async execute(
    loggedUser: LoggedUser,
    data: any,
  ): Promise<IOnboardingResponse> {
    // 1️⃣ Ricarico lo stato dal DB
    const onboarding = await this.onboardingService.findByUserId(loggedUser);
    if (!onboarding) throw new Error('Onboarding non trovato');

    // Logica specifica del passo: ad esempio verifica che nome, cognome e email siano compilati
    const requiredFields = await this.validateProfile(loggedUser);

    const completedSteps = onboarding.completedSteps || [];
    completedSteps.push(this.step);
    return {
      userId: loggedUser.id,
      currentStep: this.step,
      nextStep:
        requiredFields.length > 0 ? this.step : OnboardingStep.TENANT_CREATION,
      requiredFields,
      action: requiredFields.length > 0 ? Actions.CONTINUE : Actions.NONE,
      reason: null,
      completedSteps,
    };
  }

  private async validateProfile(
    loggedUser: LoggedUser,
  ): Promise<string[]> {
    // esempio: ritorna campi mancanti
    const missing: string[] = [];
    const profile = await this.getProfile(loggedUser);
    if (!profile.firstName) missing.push("firstName");
    if (!profile.lastName) missing.push("lastName");
    if (!profile.email) missing.push("email");
    return missing;
  }

  async getProfile(
    loggedUser: LoggedUser,
  ): Promise<{ firstName?: string; lastName?: string; email?: string }> {
    const res = await this.get(`/v1/profiles/${loggedUser.id}`, loggedUser.token.originDto);
    const profile = res.data;
    if (!profile) {
      return {};
    }

    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
    };
  }
}
