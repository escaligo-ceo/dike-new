import {
  AccessAction,
  AccessResponse,
  AccessStatus,
  AccessStep,
  AccessStepStatus,
  Actions,
  AppLogger,
  ILoginResult,
  IVerificationResult,
  LoginUserDto,
  OriginDto,
  StepResult,
  TokenType,
  VerificationDto,
  VerificationTokenService,
} from "@dike/common";
import { KeycloakService, LoggedUser, IBaseStep } from "@dike/communication";
import { Injectable } from "@nestjs/common";
import { HttpAuthService } from "../../communication/http.auth.service";
import { HttpNotificationService } from "../../communication/http.notification.service";
import { OnboardingStepService } from "./steps/onboarding.step";
import { VerifyEmailService } from "../verify-email/verify-email.service";
import { VerifyEmailStep } from "./steps/verify-email.step";
import { AuthorizeUserStep } from "./steps/authorize-user.step";

@Injectable()
export class AccessService {
  constructor(
    private readonly _logger: AppLogger,
    private readonly _httpAuthService: HttpAuthService,
    private readonly _httpNotificationService: HttpNotificationService,
    private readonly _verificationTokenService: VerificationTokenService,
    private readonly _keycloakService: KeycloakService,
    private readonly _onboardingService: OnboardingStepService,
    private readonly _verifyEmailFlow: VerifyEmailService,
  ) {
    this._logger = new AppLogger(AccessService.name);
  }

  async internalExchangeToken(
    originDto: OriginDto,
    token: string,
  ): Promise<{ token: string }> {
    return this._httpAuthService.internalExchangeToken(originDto, token);
  }

  async start(
    loggedUser: LoggedUser,
  ): Promise<AccessResponse> {
    const steps: IBaseStep[] = [
      new AuthorizeUserStep(
        this._httpAuthService,
        this._httpAuthService,
      ),
      new VerifyEmailStep(
        this._httpAuthService,
        this._verifyEmailFlow,
        this._keycloakService,
      ),
      new OnboardingStepService(
        this._onboardingService as any,
      ),
    ];

    let loginResult: ILoginResult | undefined;
    let refreshToken: string | undefined;
    for (const step of steps) {
      const result = await step.execute(loggedUser, {});

      if (result.status !== AccessStepStatus.COMPLETED) {
        // blocco immediato e restituisci al FE
        return this.mapStepResultToAccessResponse(result);
      }
      loginResult = result.token as ILoginResult;
      refreshToken = result.refreshToken;
    }

    if (!loginResult?.access_token) {
      throw new Error("Access token not found");
    }
    if (!refreshToken) {
      throw new Error("Refresh token not found");
    }

    // Tutti gli step completati → accesso finale
    return {
      status: AccessStatus.SUCCESS,
      step: AccessStep.READY,
      stepStatus: AccessStepStatus.COMPLETED,
      nextAction: AccessAction.ACCESS_APP,
      token: {
        type: "FULL",
        value: loginResult.access_token,
      },
      refreshToken,
    };
  }

  async resendEmailVerification(
    loggedUser: LoggedUser,
    dto: any,
  ): Promise<AccessResponse> {
    const verificationLink: IVerificationResult =
      this._verificationTokenService.generateEmailVerificationToken({
        userId: loggedUser.id,
        email: dto.email,
        tokenType: TokenType.EMAIL_VERIFICATION,
      });

    const payload: VerificationDto = {
      email: dto.email,
      verificationLink: verificationLink.verificationUrl,
      username: loggedUser.username ? loggedUser.username : undefined,
    };
    const res = await this._httpNotificationService.sendEmailVerification(
      loggedUser,
      payload,
    );

    return {
      status: AccessStatus.SUCCESS,
      step: AccessStep.EMAIL_VERIFICATION,
      stepStatus: AccessStepStatus.PENDING,
      nextAction: AccessAction.VERIFY_EMAIL,
      message: "Email di verifica inviata",
      token: {
        type: "LIMITED",
        value: loggedUser.token.accessToken,
      },
      refreshToken: loggedUser.token.refreshToken,
    };
  }

  mapStepResultToAccessResponse<T>(result: StepResult<T>): AccessResponse<T> {
    return {
      // Mappo lo status generale in base allo status dello step
      status:
        result.status === Actions.OK
          ? AccessStatus.SUCCESS
          : result.status === Actions.BLOCKED
            ? AccessStatus.FAILURE
            : AccessStatus.PENDING,

      step: result.step,

      // Step interno, utile per FE
      stepStatus:
        result.status === Actions.OK
          ? AccessStepStatus.COMPLETED
          : result.status === Actions.BLOCKED
            ? AccessStepStatus.BLOCKED
            : AccessStepStatus.PENDING,

      // Prossima azione guidata per la UX
      nextAction:
        result.status !== Actions.OK
          ? result.nextStep === AccessStep.EMAIL_VERIFICATION
            ? AccessAction.VERIFY_EMAIL
            : result.nextStep === AccessStep.ONBOARDING
              ? AccessAction.START_ONBOARDING
              : result.nextStep === AccessStep.F2A_VERIFICATION
                ? AccessAction.VERIFY_2FA
                : result.nextStep === AccessStep.SELECT_TENANT
                  ? AccessAction.SHOW_TENANT_SELECTION
                  : undefined
          : undefined,

      message: result.reason ?? undefined,
      context: result.context ?? undefined, // qui metti IOnboardingResponse o altri payload dello step
      token: result.token ?? undefined, // opzionale, se lo step ha generato un token limitato
    };
  }
}
