import {
  AppLogger,
  DikeConfigService,
  DikeJwtService,
  VerificationTokenService,
} from "@dike/common";
import {
  ApiGatewayService,
  AuditModule,
  JwtAuthGuard,
  KeycloakService,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { CommunicationModule as AppCommunicationModule } from "../communication/communication.module";
import { HttpAuthService } from "../communication/http.auth.service";
import { OnboardingModule } from "../onboarding/onboarding.module";
import { AccessFlowController } from "./access.controller";
import { AccessService } from "./access.service";
import { OnboardingStepService } from "./steps/onboarding.step";

@Module({
  imports: [
    HttpModule,
    AppCommunicationModule,
    AuditModule,
    OnboardingModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [AccessFlowController],
  providers: [
    AccessService,
    ConfigService,
    DikeConfigService,
    AppLogger,
    HttpAuthService,
    ApiGatewayService,
    UserFactory,
    KeycloakService,
    DikeJwtService,
    JwtAuthGuard,
    VerificationTokenService,
    OnboardingStepService,
  ],
})
export class AccessModule {}
