export interface IValidateUserResponse {
  access_token: string;
  refresh_token: string;
}

export interface IKeycloakUserInfo {
  id: string;
  email: string;
  emailVerified: boolean;
  username: string;
}

export interface ITokenResponse extends IValidateUserResponse {
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  // not_before_policy: number;
  "not-before-policy": number;
  session_state: string;
  scope: string;
  id_token?: string; // presente se richiesto
}

export interface IGetTokenResult extends IValidateUserResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string; // 'Bearer'
  id_token: string;
  "not-before-policy": number;
  session_state: string;
  scope: string; // 'openid profile email'
}

export interface DecodedKeycloakToken {
  sub: string;                 // ID dell’utente
  email: string;
  preferred_username?: string;
  tenant: string;              // ID del tenant selezionato
  realm_access?: {
    roles: string[];
  };
  email_verified: boolean;
  exp?: number;                // timestamp di scadenza
  [key: string]: any;          // altri claim
}
