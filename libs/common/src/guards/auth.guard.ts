import { UserFactory } from '@dike/communication';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { DikeJwtService } from '../jwt/jwt.service.js';

// @Injectable()
// export class AuthGuard implements CanActivate {
//   canActivate(context: ExecutionContext): boolean {
//     const request = context.switchToHttp().getRequest<Request>();
//     const authHeader = request.headers['authorization'];
//     if (!authHeader?.startsWith('Bearer ')) {
//       return false;
//     }
//     const token = authHeader.slice(7);
//     // Puoi aggiungere qui la logica di validazione del token
//     request['accessToken'] = token; // Salva il token nella request
//     return true;
//   }
// }

// @Injectable()
// export class AuthGuard implements CanActivate {
//   // Iniettiamo la tua factory per centralizzare la creazione dell'utente
//   constructor(private readonly userFactory: UserFactory) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest<Request>();
//     const authHeader = request.headers['authorization'];

//     if (!authHeader?.startsWith('Bearer ')) {
//       return false;
//     }

//     const token = authHeader.slice(7);

//     // Recuperiamo IP e UA (usando la stessa logica dei tuoi decorator)
//     const ip = (request.headers['x-forwarded-for'] as string) || request.ip;
//     const ua = request.headers['user-agent'];

//     try {
//       // TRUCCO PIGNOLO: Trasformiamo il token grezzo nell'oggetto User qui!
//       const loggedUser = this.userFactory.fromToken(
//         token,
//         ip,
//         ua,
//         authHeader // Passiamo l'intero header se serve alla factory
//       );

//       // Lo "attacchiamo" alla request. 
//       // NestJS usa convenzionalmente la chiave 'user'
//       request['user'] = loggedUser; 
//       request['accessToken'] = token;

//       return true;
//     } catch (error) {
//       // Se la factory fallisce (token scaduto o malformato), il guard blocca tutto
//       return false;
//     }
//   }
// }

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly userFactory: UserFactory,
    private readonly dikeJwtService: DikeJwtService, // Iniettiamo il tuo servizio
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader =
      request.headers["authorization"] ||
      request.cookies?.access_token ||
      request.cookies?.["keycloak-token"] ||
      null;

    if (!authHeader?.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.slice(7);

    try {
      // 1. Decodifichiamo il token usando il tuo servizio
      // Se è un token Keycloak, usiamo decode. Se è il tuo di verifica, usiamo verify.
      const decodedToken = this.dikeJwtService.decode(token);

      // Recuperiamo IP e UA (usando la stessa logica dei tuoi decorator)
      const ip =
        request.headers['x-forwarded-for'] ||
        request.ip ||
        null;
      const ua =
        request.headers['x-forwarded-user-agent'] ||
        request.headers['user-agent'] ||
        null;

      // 2. Ora il tipo è corretto per la factory!
      const loggedUser = this.userFactory.fromToken(
        decodedToken, // Passiamo l'oggetto decodificato
        ip,   // O la tua logica x-forwarded-for
        ua,
        authHeader
      );

      request['user'] = loggedUser;
      request['accessToken'] = token;

      return true;
    } catch (error) {
      return false;
    }
  }
}