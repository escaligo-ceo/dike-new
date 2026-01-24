import {
  AppLogger,
  DikeConfigService,
  JwtStrategy,
  DikeJwtService,
} from "@dike/common";
import { ApiGatewayService, KeycloakService, UserFactory } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { OnboardingController } from "./onboarding.controller";
import { OnboardingService } from "./onboarding.service";

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
  ],
  providers: [
    AppLogger,
    ApiGatewayService,
    UserFactory,
    JwtStrategy,
    OnboardingService,
    DikeConfigService,
    ConfigService,
    KeycloakService,
    DikeJwtService,
  ],
  controllers: [OnboardingController],
  exports: [ApiGatewayService],
})
export class OnboardingModule {}
