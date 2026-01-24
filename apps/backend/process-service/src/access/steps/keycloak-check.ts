import {
  AccessAction,
  AccessResponse,
  AccessStatus,
  AccessStep,
  AccessStepStatus,
  AppLogger,
  IStep,
  AccessTokenType,
} from "@dike/common";
import { LoggedUser } from "@dike/communication";
import { HttpAuthService } from "../../communication/http.auth.service";

export class KeycloakCheckStep implements IStep {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly httpAuthService: HttpAuthService,
  ) {
    this.logger = new AppLogger(KeycloakCheckStep.name);
  }

async execute(loggedUser: LoggedUser): Promise<AccessResponse> {
  // Logica specifica del passo: ad esempio verifica che l'utente sia autenticato
  const requiredFields = await this.validateAuth(loggedUser);

  const stepCompleted = requiredFields.length === 0;

  return {
    step: AccessStep.AUTHENTICATION,
    status: stepCompleted ? AccessStatus.SUCCESS : AccessStatus.PENDING,
    stepStatus: stepCompleted ? AccessStepStatus.COMPLETED : AccessStepStatus.PENDING,
    
    // nextAction guidata solo se non completato
    nextAction: !stepCompleted ? AccessAction.VERIFY_EMAIL : undefined,

    message: stepCompleted
      ? "Authentication successful"
      : "User authentication pending: missing required fields",

    // token opzionale, qui non generiamo token reale
    token: {
      type: "NONE" as AccessTokenType,
    },

    // eventuale context con dati utili per il passo corrente
    context: requiredFields.length > 0 ? { missingFields: requiredFields } : undefined,
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
    const response = await this.httpAuthService.getUser(loggedUser);
    return response.data;
  }
}
