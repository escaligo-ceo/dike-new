import {
  Actions,
  AppLogger,
  DikeConfigService,
  IOnboardingResponse,
  IStep,
  OnboardingStep,
} from "@dike/common";
import { BaseHttpService, LoggedUser } from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import { Inject, Injectable, forwardRef } from "@nestjs/common";
import { HttpTenantService } from "../../communication/http.tenant.service";
import { OnboardingService } from "../onboarding.service";

@Injectable()
export class TenantStepService extends BaseHttpService implements IStep {
  step = OnboardingStep.TENANT_CREATION;
  nextStep = OnboardingStep.ASSIGN_SUBSCRIPTION;

  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    @Inject(forwardRef(() => OnboardingService))
    private readonly onboardingService: OnboardingService,
    private readonly httpTenantService: HttpTenantService
  ) {
    super(
      httpService,
      new AppLogger(TenantStepService.name),
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

    // qui logica per verificare tenantName e tenantDomain
    const requiredFields: string[] = await this.validateTenant(loggedUser);

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

  private async validateTenant(
    loggedUser: LoggedUser,
  ): Promise<string[]> {
    const tenantId = await this.onboardingService.getTenantIdByUserId(loggedUser.id);
    if (!tenantId) {
      throw new Error(`Tenant not found for userId: ${loggedUser.id}`);
    }
    const tenant = await this.httpTenantService.getTenant(loggedUser, tenantId);
    const missing: string[] = [];
    if (!tenant?.name) missing.push("tenantName");
    // if (!tenant?.domain) missing.push("tenantDomain");
    return missing;
  }

  async findByUserId(
    loggedUser: LoggedUser,
  ): Promise<{ exists: boolean }> {
    const res = await this.get("v1/tenants", loggedUser.token.originDto);
    const tenant = res.data;
    if (!tenant) {
      return { exists: false };
    }
    return {
      exists: !!tenant,
    };
  }
}
