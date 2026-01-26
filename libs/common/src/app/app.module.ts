import { Global, Module } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { DikeConfigService } from "./load-env-values.js";
import { DikeJwtService } from "../jwt/jwt.service.js";
import { AppLogger } from "./logger.js";

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || "dike-secret-key",
      signOptions: { expiresIn: "1d" },
    }),
  ],
  providers: [DikeConfigService, Reflector, DikeJwtService, AppLogger],
  exports: [DikeConfigService, Reflector, DikeJwtService, AppLogger, JwtModule],
})
export class DikeModule {}
