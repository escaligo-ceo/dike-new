import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AppLogger } from "../app/logger.js";
import { IVerificationToken } from "../access/verification-token.interface.js";
import { DikeConfigService } from "../app/load-env-values.js";

export class DikeJwtService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: DikeConfigService,
    private readonly logger: AppLogger
  ) {
    this.logger = new AppLogger(DikeJwtService.name);
  }

  get secret(): string {
    return `${this.configService.env("JWT_SECRET", "dike-secret-key")}_verification`;
  }

  decode(token: string) {
    return this.jwtService.decode(token);
  }

  sign(payload: any, options: any): string {
    return this.jwtService.sign(payload, {
      ...options,
      secret: this.secret,
    });
  }

  verify(token: string, options: any): IVerificationToken {
    try {
      const decoded = this.jwtService.verify(token, {
        ...options,
        secret: this.secret,
      });
      return decoded as IVerificationToken;
    } catch (error) {
      this.logger.error(`Token verification failed: ${error}`);
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
