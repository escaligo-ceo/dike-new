import { AppLogger, DikeConfigService, DikeJwtService, VerificationTokenService } from "@dike/common";
import {
  ApiGatewayService,
  AuditLog,
  AuditModule,
  KeycloakService,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseModule } from "../database/database.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    DatabaseModule,
    TypeOrmModule.forFeature([AuditLog]),
    AuditModule,
  ],
  controllers: [AdminController],
  providers: [
    AppLogger,
    AdminService,
    DikeConfigService,
    ConfigService,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
    JwtService,
    VerificationTokenService,
    DikeJwtService,
  ],
  exports: [AdminService],
})
export class AdminModule {}
