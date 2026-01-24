import {
  AppLogger,
  DikeConfigService,
  DikeJwtService,
  VerificationTokenService,
} from "@dike/common";
import {
  ApiGatewayService,
  AuditModule,
  KeycloakService,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppService } from "../app.service";
import { entities } from "../database/entities";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature(entities),
    ConfigModule,
    AuditModule,
  ],
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
    JwtService,
    VerificationTokenService,
    DikeJwtService,
  ],
  exports: [AdminService],
})
export class AdminModule {}
