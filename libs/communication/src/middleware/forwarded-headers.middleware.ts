import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ForwardedHeadersMiddleware implements NestMiddleware {
  private readonly antiSpoofing = process.env.ANTISPOOFING === 'true';

  use(req: Request, res: Response, next: NextFunction) {
    if (this.antiSpoofing) {
      // Modalità sicura: ignoro gli header ricevuti e li ricalcolo
      const realIp = req.ip || req.socket.remoteAddress;
      const realUserAgent = req.headers['user-agent']?.toString() || '';

      req.headers['x-forwarded-for'] = realIp;
      req.headers['x-forwarded-user-agent'] = realUserAgent;
    } else {
      // Modalità permissiva: uso eventuali valori forwardati dal FE
      const forwardedIp =
        req.headers['x-forwarded-for']?.toString() ||
        req.ip ||
        req.socket.remoteAddress;

      const forwardedUserAgent =
        req.headers['x-forwarded-user-agent']?.toString() ||
        req.headers['user-agent']?.toString() ||
        '';

      req.headers['x-forwarded-for'] = forwardedIp;
      req.headers['x-forwarded-user-agent'] = forwardedUserAgent;
    }

    next();
  }
}
