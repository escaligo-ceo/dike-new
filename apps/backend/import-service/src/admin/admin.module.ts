import { AppLogger, DikeConfigService, DikeJwtService, VerificationTokenService } from "@dike/common";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppService } from "../app.service";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { ApiGatewayService, AuditModule, KeycloakService, UserFactory } from "@dike/communication";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [HttpModule, ConfigModule, AuditModule],
  controllers: [AdminController],
  providers: [
    AppLogger,
    AppService,
    AdminService,
    DikeConfigService,
    ConfigService,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
    VerificationTokenService,
    JwtService,
    DikeJwtService,
  ],
  exports: [],
})
export class AdminModule {}
