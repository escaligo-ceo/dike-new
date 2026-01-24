import { AppLogger, DikeConfigService, DikeJwtService } from "@dike/common";
import { ApiGatewayService, AuditModule, KeycloakService, UserFactory } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { entities } from "../database/entities";
import { ProfileService } from "../profile/profile.service";
import { OnboardingController } from "./onboarding.controller";
import { OnboardingService } from "./onboarding.service";

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    AuditModule,
    HttpModule,
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
    OnboardingService,
    ProfileService,
    AppLogger,
    ApiGatewayService,
    KeycloakService,
    UserFactory,
    DikeConfigService,
    DikeJwtService,
  ],
  exports: [OnboardingService],
  controllers: [OnboardingController],
})
export class OnboardingModule {}
