import {
  AccessAction,
  AccessResponse,
  AccessStatus,
  AccessStep,
  AccessStepStatus,
  AppLogger,
  ILoginResult,
  LoginDto,
} from "@dike/common";
import { KeycloakService, LoggedUser, IBaseStep } from "@dike/communication";
import { HttpAuthService } from "../../../communication/http.auth.service";
import { VerifyEmailService } from "../../verify-email/verify-email.service";

export class VerifyEmailStep implements IBaseStep {
  protected readonly logger: AppLogger;

  constructor(
    protected readonly httpAuthService: HttpAuthService,
    private readonly verifyEmailFlow: VerifyEmailService,
    private readonly _keycloakService: KeycloakService,
  ) {
    this.logger = new AppLogger(VerifyEmailStep.name);
  }

  async execute(loginResult: ILoginResult): Promise<AccessResponse> {
    // lo stato di verifica lo conosci già dal passo precedente KeycloakCheckStep
    // const emailVerified = loggedUser.token?.emailVerified ?? false;
    if (!loginResult.emailVerified) {
      const loginDto: LoginDto = new LoginDto(loginResult);
      await this.verifyEmailFlow.start(loginDto);
    }

    return {
      step: AccessStep.EMAIL_VERIFICATION,
      status: loginResult.emailVerified ? AccessStatus.SUCCESS : AccessStatus.PENDING,
      stepStatus: loginResult.emailVerified ? AccessStepStatus.COMPLETED : AccessStepStatus.PENDING,
      nextAction: loginResult.emailVerified ? AccessAction.START_ONBOARDING : AccessAction.VERIFY_EMAIL,
      message: loginResult.emailVerified
        ? "Email successfully verified"
        : "Please verify your email to continue.",
      token: {
        type: "LIMITED",
        value: loginResult.access_token,
      },
      context: loginResult.emailVerified ? undefined : { email: loginResult.email },
    };
  }

  private async getAuthInfo(loggedUser: LoggedUser): Promise<any> {
    const url = `/v1/auth/${loggedUser.id}`;
    return this._keycloakService.getUserInfo(loggedUser);
  }
}
