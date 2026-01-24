import { AppLogger, DikeConfigService, DikeJwtService, VerificationTokenService } from "@dike/common";
import {
  ApiGatewayService,
  AuditModule,
  BaseAdminService,
  KeycloakService,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AdminController } from "./admin.controller";
import { HttpAuthService } from "../communication/http.auth.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    AuditModule,
  ],
  controllers: [AdminController],
  providers: [
    AppLogger,
    DikeConfigService,
    ConfigService,
    UserFactory,
    ApiGatewayService,
    HttpAuthService,
    KeycloakService,
    BaseAdminService,
    JwtService,
    VerificationTokenService,
    DikeJwtService,
  ],
  exports: [],
})
export class AdminModule {}