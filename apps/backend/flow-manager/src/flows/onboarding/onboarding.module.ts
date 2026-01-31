import {
  AppLogger,
  DikeConfigService,
  DikeJwtService,
  Onboarding,
} from "@dike/common";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommunicationModule } from "../communication/communication.module";
import { OnboardingController } from "./onboarding.controller";
import { OnboardingService } from "./onboarding.service";
import { OfficeStepService } from "./steps/create-office.step";
import { SubscriptionStepService } from "./steps/create-subscription.step";
import { TeamStepService } from "./steps/create-team.step";
import { TenantStepService } from "./steps/create-tenant.step";
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forFeature([Onboarding]),
    HttpModule,
    CommunicationModule,
  ],
  controllers: [OnboardingController],
  providers: [
    OnboardingService,
    TenantStepService,
    SubscriptionStepService,
    TeamStepService,
    OfficeStepService,
    AppLogger,
    DikeConfigService,
    DikeJwtService,
    Reflector,
  ],
  exports: [OnboardingService],
})
export class OnboardingModule {}
