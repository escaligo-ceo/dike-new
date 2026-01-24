import { AppLogger, DikeConfigService, DikeJwtService } from "@dike/common";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { ProfileModule } from "../profile/profile.module";
import { OnboardingController } from "./onboarding.controller";
import { OnboardingService } from "./onboarding.service";
import { ApiGatewayService, UserFactory, KeycloakService } from "@dike/communication";

@Module({
  imports: [
    HttpModule,
    ProfileModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [OnboardingController],
  providers: [
    OnboardingService,
    AppLogger,
    DikeConfigService,
    ConfigService,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
    DikeJwtService,
  ],
})
export class OnboardingModule {}
