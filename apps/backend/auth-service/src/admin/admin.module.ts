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
import { AuthService } from "../auth/auth.service";
import { CommunicationModule } from "../communication/communication.module";
import { HttpNotificationService } from "../communication/http.notification.service";
import { WatchedPersonModule } from "../watched-person/watched-person.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { HttpProcessService } from "../communication/http.process.service";
import { entities } from "../database/entites";

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature(entities),
    ConfigModule,
    CommunicationModule,
    WatchedPersonModule,
    AuditModule,
  ],
  controllers: [AdminController],
  providers: [
    AppLogger,
    AppService,
    HttpNotificationService,
    AdminService,
    VerificationTokenService,
    JwtService,
    KeycloakService,
    ConfigService,
    DikeConfigService,
    UserFactory,
    ApiGatewayService,
    AuthService,
    HttpProcessService,
    DikeJwtService,
  ],
  exports: [],
})
export class AdminModule {}
