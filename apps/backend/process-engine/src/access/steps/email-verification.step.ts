import {
  AccessAction,
  AccessResponse,
  AccessStatus,
  AccessStep,
  AccessStepStatus,
  AppLogger,
} from "@dike/common";
import { KeycloakService, LoggedUser, IStep } from "@dike/communication";
import { HttpAuthService } from "../../communication/http.auth.service";

export class EmailVerificationStep implements IStep {
  constructor(
    protected readonly httpAuthService: HttpAuthService,
    protected readonly logger: AppLogger,
    private readonly keycloakService: KeycloakService,
  ) {
    this.logger = new AppLogger(EmailVerificationStep.name);
  }

  async execute(loggedUser: LoggedUser): Promise<AccessResponse> {
    // lo stato di verifica lo conosci già dal passo precedente KeycloakCheckStep
    const emailVerified = loggedUser.token?.emailVerified ?? false;

    return {
      step: AccessStep.EMAIL_VERIFICATION,
      status: emailVerified ? AccessStatus.SUCCESS : AccessStatus.PENDING,
      stepStatus: emailVerified ? AccessStepStatus.COMPLETED : AccessStepStatus.PENDING,
      nextAction: emailVerified ? AccessAction.START_ONBOARDING : AccessAction.VERIFY_EMAIL,
      message: emailVerified
        ? "Email successfully verified"
        : "Please verify your email to continue.",
      token: {
        type: "LIMITED",
        value: loggedUser.token?.accessToken,
      },
      context: emailVerified ? undefined : { email: loggedUser.email },
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
    return this.keycloakService.getUserInfo(loggedUser);
  }
}
