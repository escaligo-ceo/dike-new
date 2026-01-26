import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AppLogger } from "../app/logger.js";
import { DikeConfigService } from "../app/load-env-values.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    private readonly logger: AppLogger,
    private readonly configService: DikeConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: `${configService.env("JWT_SECRET", "dike-secret-key")}_verification`,
    });
    this.logger = new AppLogger(JwtStrategy.name);
    this.logger.debug("JwtStrategy initialized with secret");
  }

  get secret(): string {
    return `${this.configService.env("JWT_SECRET", "dike-secret-key")}_verification`;
  }

  async validate(payload: any) {
    // Qui viene iniettato in req.user
    return { sub: payload.sub, email: payload.email };
  }
}
