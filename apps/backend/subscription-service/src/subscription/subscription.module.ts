import { AppLogger, DikeConfigService, DikeJwtService, DikeModule } from "@dike/common";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { entities } from "../database/entities";
import { FeatureService } from "../feature/feature.service";
import { PlanService } from "../plan/plan.service";
import { SubscriptionController } from "./subscription.controller";
import { SubscriptionService } from "./subscription.service";
import { ApiGatewayService, KeycloakService, UserFactory } from "@dike/communication";

@Module({
  imports: [DikeModule, TypeOrmModule.forFeature(entities), HttpModule],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    ConfigService,
    PlanService,
    FeatureService,
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
