import {
  AccessAction,
  AccessResponse,
  AccessStatus,
  AccessStep,
  AccessStepStatus,
  Actions,
  AppLogger,
  IStep,
  IVerificationResult,
  LoginUserDto,
  OriginDto,
  StepResult,
  TokenType,
  VerificationDto,
  VerificationTokenService,
} from "@dike/common";
import { KeycloakService, LoggedUser } from "@dike/communication";
import { Injectable } from "@nestjs/common";
import { HttpAuthService } from "../communication/http.auth.service";
import { HttpNotificationService } from "../communication/http.notification.service";
import { EmailVerificationStep } from "./steps/email-verification.step";
import { KeycloakCheckStep } from "./steps/keycloak-check";
import { OnboardingStepService } from "./steps/onboarding.step";

@Injectable()
export class AccessService {
  constructor(
    private readonly logger: AppLogger,
    private readonly httpAuthService: HttpAuthService,
    private readonly httpNotificationService: HttpNotificationService,
    private readonly verificationTokenService: VerificationTokenService,
    private readonly keycloakService: KeycloakService,
    private readonly onboardingService: OnboardingStepService,
  ) {
    this.logger = new AppLogger(AccessService.name);
  }

  async internalExchangeToken(
    originDto: OriginDto,
    token: string,
  ): Promise<{ token: string }> {
    return this.httpAuthService.internalExchangeToken(originDto, token);
  }

  async startAccessFlow(
    loggedUser: LoggedUser,
    loginUserDto: LoginUserDto,
  ): Promise<AccessResponse> {
    const loginResult = await this.httpAuthService.login(
      loggedUser.token.originDto,
      loginUserDto,
    );

    const steps: IStep[] = [
      new KeycloakCheckStep(
        new AppLogger(KeycloakCheckStep.name),
        this.httpAuthService as any,
      ),
      new EmailVerificationStep(
        this.httpAuthService as any,
        new AppLogger(EmailVerificationStep.name),
        this.keycloakService as any,
      ),
      new OnboardingStepService(
        new AppLogger(OnboardingStepService.name),
        this.httpAuthService as any,
        this.onboardingService as any,
      ),
    ];

    for (const step of steps) {
      const result = await step.execute(loggedUser, {});

      if (result.status !== AccessStepStatus.COMPLETED) {
        // blocco immediato e restituisci al FE
        return this.mapStepResultToAccessResponse(result);
      }
    }

    // Tutti gli step completati → accesso finale
    return {
      status: AccessStatus.SUCCESS,
      step: AccessStep.READY,
      stepStatus: AccessStepStatus.COMPLETED,
      nextAction: AccessAction.ACCESS_APP,
      token: { type: "FULL", value: loginResult.access_token },
      refreshToken: loginResult.refresh_token,
    };
  }

  async resendEmailVerification(
    loggedUser: LoggedUser,
    dto: any,
  ): Promise<AccessResponse> {
    const verificationLink: IVerificationResult =
      this.verificationTokenService.generateEmailVerificationToken({
        userId: loggedUser.id,
        email: dto.email,
        tokenType: TokenType.EMAIL_VERIFICATION,
      });

    const payload: VerificationDto = {
      email: dto.email,
      verificationLink: verificationLink.verificationUrl,
      username: loggedUser.username ? loggedUser.username : undefined,
    };
    const res = await this.httpNotificationService.sendEmailVerification(
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
