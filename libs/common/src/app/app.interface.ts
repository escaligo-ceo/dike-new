import { Request } from 'express';

export interface IPingResponse {
  name: string;
  version: string;
  copyright: string;
  uptime: number;
  timestamp: string;
  services?: {
    [name: string]: string;
  }
}

export interface IAuthenticatedRequest extends Request {
  user: any; // Dati dell'utente dal token JWT
  csrfToken?: () => string; // Metodo opzionale per compatibilità csurf
  token: string; // JWT user token
}

export interface CsrfRequest extends Request {
  session: {
    csrfToken?: string;
  };
}
