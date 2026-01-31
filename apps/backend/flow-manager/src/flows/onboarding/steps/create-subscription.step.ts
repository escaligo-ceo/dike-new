import {
  Actions,
  AppLogger,
  DikeConfigService,
  IOnboardingResponse,
  OnboardingStep,
} from "@dike/common";
import { BaseHttpService, LoggedUser, IStep } from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { HttpTenantService } from "../../communication/http.tenant.service";
import { OnboardingService } from "../onboarding.service";

@Injectable()
export class SubscriptionStepService extends BaseHttpService implements IStep {
  step = OnboardingStep.ASSIGN_SUBSCRIPTION;
  nextStep = OnboardingStep.TEAM_CREATION;

  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    private readonly httpTenantService: HttpTenantService,
    @Inject(forwardRef(() => OnboardingService))
    private readonly onboardingService: OnboardingService
  ) {
    super(
      httpService,
      new AppLogger(SubscriptionStepService.name),
      configService,
      configService.env("SUBSCRIPTION_SERVICE_URL", "http://localhost:8004/api")
    );
  }

  async execute(
    loggedUser: LoggedUser,
    data: any,
  ): Promise<IOnboardingResponse> {
    // 1️⃣ Ricarico lo stato dal DB
    const onboarding = await this.onboardingService.findByUserId(loggedUser);
    if (!onboarding) throw new Error('Onboarding non trovato');

    const tenantId = await this.onboardingService.getTenantIdByUserId(loggedUser.id);
    if (!tenantId) {
      throw new Error(`Tenant not found for userId: ${loggedUser.id}`);
    }
    const requiredFields = await this.validateSubscription(
      loggedUser,
      tenantId
    );

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

  private async validateSubscription(
    loggedUser: LoggedUser,
    tenantId: string
  ): Promise<string[]> {
    // esempio: verifica piano assegnato
    const subscription = await this.getSubscription(
      loggedUser,
      tenantId
    );
    return subscription ? [] : ["plan"];
  }

  async getSubscription(
    loggedUser: LoggedUser,
    tenantId: string
  ): Promise<{ exists: boolean; plan?: string }> {
    const res = await this.get(`/v1/subscriptions/${tenantId}`, loggedUser.token.originDto);
    const subscription = res.data;
    if (!subscription) {
      return { exists: false };
    }

    return {
      exists: true,
      // plan: res.plan, // FIXME: adattare in base alla risposta effettiva
    };
  }
}
