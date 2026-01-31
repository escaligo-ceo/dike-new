import { HttpStatus } from "@nestjs/common";
import { Actions } from "../app/actions.js";
import { IOnboardingResponse } from "../onboarding/onboarding.interface.js";
import { AccessAction, AccessStatus, AccessStep, AccessStepStatus } from "./access.enum.js";
import { AccessTokenType, RegistrationStatus } from "./access.type.js";

export interface ILoginResult {
  success: boolean;
  access_token?: string;
  refresh_token?: string;
  redirectUrl?: string;
  userId?: string;
  // tenantId?: string; // do not made it publicly available
  status: number;
  loginStatus: AccessStatus;
  message?: string;
  emailVerified?: boolean;
  onboarding?: IOnboardingResponse;
  email?: string;
  username?: string;

  // loginStatus: LoginStatus;

  /**
   * lo userId dell'utente è un dato di sistema e non va mostrato all'utente, esso è annegato nel jwtToken
   */
  // userId?: string;

  // dati sicuri da esporre al FE

  // NON esporre tenantId reale!
  /**
   * quando l'utente ha a disposizione più tenant, espongo gli alias dei tenant associati per motivi di sicurezza
   * i codici reali usati dal sistema lato BE non vengono esposti
   */
  tenantAliases?: string[]; // array di alias dei tenant associati, prop valorabile solo se l'utente ha più tenant
}

export enum LoginStatus {
  SUCCESS = 0,
  EMAIL_NOT_VERIFIED = 1,
  FAILED = 2,
}

export interface ICreateUserResponse {
  userId?: string;
  email: string;
  username?: string;
  status?: RegistrationStatus;
}

export interface IRegisterUserResult extends ICreateUserResponse {
  link?: string; // link di verifica della mail
  token?: string; // token da salvare nella tabella del serizio profile
  expiresAt?: Date; // Data di scadenza del token
  status: RegistrationStatus;
  success: boolean;
}

export interface IRegisterResult {
  success: boolean;
  status: HttpStatus;
  registrationStatus: RegistrationStatus;
  message: string;
  id: string | undefined;
  email: string;
}

// export interface AccessResponse {
//   userId: string;                     // id dell'utente (un utente può avere al più un solo onboarding)
//   currentStep: AccessStep | null; // step corrente, null se non iniziato
//   nextStep: AccessStep | null;    // passo successivo
//   requiredFields?: string[];          // campi mancanti o richiesti
//   action: Actions;                    // START | CONTINUE | RETRY | NONE
//   reason?: string | null;             // opzionale, per FAILED o RETRY
// }

export interface AccessResponse<T = any> {
  status: AccessStatus;

  step?: AccessStep;
  stepStatus?: AccessStepStatus;

  // UX / navigazione
  nextAction?: AccessAction;
  message?: string;


  // Sicurezza
  token?: {
    type: AccessTokenType;
    value?: string;
    expiresAt?: number; // timestamp in ms
  };

  // refresh token separato
  refreshToken?: string;

  // Dati utili allo step corrente
  context?: T;
}

export interface StepResult<T = any> {
  step: AccessStep;
  status: Actions;
  nextStep?: AccessStep;
  reason?: string;
  context?: T;

  // aggiunto opzionale per step COMPLETED
  token?: {
    type: AccessTokenType;
    value: string;
  };
  refreshToken?: string;
}
