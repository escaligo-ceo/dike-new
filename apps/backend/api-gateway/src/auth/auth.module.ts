import {
  AppLogger,
  DikeConfigService,
  DikeJwtService,
} from "@dike/common";
import { AuditModule, JwtAuthGuard, KeycloakService } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { CommunicationModule as AppCommunicationModule } from "../communication/communication.module";
import { NotificationService } from "../notification/notification.service";
import { ProfileService } from "../profile/profile.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import {
  ApiGatewayService,
  UserFactory,
} from "@dike/communication";
import { HttpAuthService } from "../communication/http.auth.service";

@Module({
  imports: [
    HttpModule,
    AppCommunicationModule,
    AuditModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ConfigService,
    DikeConfigService,
    AppLogger,
    // Http* and Audit services are provided by AppCommunicationModule
    HttpAuthService,
    ProfileService,
    NotificationService,
    // UserFactory and ApiGatewayService provided via AppCommunicationModule
    ApiGatewayService,
    UserFactory,
    KeycloakService,
    JwtAuthGuard,
    DikeJwtService,
  ],
})
export class AuthModule {}
