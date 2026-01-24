import { AppLogger, DikeConfigService, DikeJwtService, VerificationTokenService } from "@dike/common";
import { ApiGatewayService, AuditModule, AuditService, KeycloakService, UserFactory } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { entities } from "../database/entities";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature(entities), ConfigModule, AuditModule],
  controllers: [AdminController],
  providers: [
    AppLogger,
    AdminService,
    DikeConfigService,
    ConfigService,
    UserFactory,
    ApiGatewayService,
    KeycloakService,
    VerificationTokenService,
    JwtService,
    DikeJwtService,
  ],
  exports: [AdminService],
})
export class AdminModule {}
