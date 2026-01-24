import {
  AppLogger,
  DikeConfigService,
  DikeJwtService,
  VerificationTokenService,
} from "@dike/common";
import {
  ApiGatewayService,
  AuditModule,
  AuditService,
  HttpAuditService,
  JwtAuthGuard,
  KeycloakService,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommunicationModule } from "../communication/communication.module";
import { HttpNotificationService } from "../communication/http.notification.service";
import { EmailVerificationToken } from "../entities/email-verification-token.entity";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { HttpProcessService } from "../communication/http.process.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailVerificationToken]),
    HttpModule,
    CommunicationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    VerificationTokenService,
    AppLogger,
    ConfigService,
    DikeConfigService,
    HttpNotificationService,
    AuditService,
    HttpAuditService,
    KeycloakService,
    ApiGatewayService,
    UserFactory,
    JwtAuthGuard,
    HttpProcessService,
    DikeJwtService,
  ],
  exports: [VerificationTokenService],
})
export class AuthModule {}
