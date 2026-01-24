import { AppLogger, DikeConfigService, DikeJwtService } from "@dike/common";
import { ApiGatewayService, AuditModule, UserFactory, KeycloakService } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpSubscriptionService } from "../communication/http.subscription.service";
import { PlanController } from "./plan.controller";
import { SubscriptionController } from "./subscription.controller";
import { SubscriptionService } from "./subscription.service";
import { TenantController } from "./tenant.controller";

@Module({
  imports: [HttpModule, AuditModule, ConfigModule],
  providers: [
    SubscriptionService,
    HttpSubscriptionService,
    AppLogger,
    DikeConfigService,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
    DikeJwtService,
  ],
  controllers: [SubscriptionController, PlanController, TenantController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
