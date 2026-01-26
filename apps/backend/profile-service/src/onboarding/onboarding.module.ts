import { DikeModule } from "@dike/common";
import { AuditModule, KeycloakService, UserFactory, JwtAuthGuard, ApiGatewayService } from "@dike/communication";
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
    DikeModule,
  ],
  providers: [
    ProfileService,
    OnboardingService,
    ApiGatewayService,
    KeycloakService,
    UserFactory,
  ],
  exports: [OnboardingService],
  controllers: [OnboardingController],
})
export class OnboardingModule {}
