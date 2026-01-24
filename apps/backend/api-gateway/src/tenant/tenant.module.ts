import { AppLogger, DikeConfigService, DikeJwtService } from "@dike/common";
import { KeycloakService } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CommunicationModule } from "../communication/communication.module";
import { HttpSubscriptionService } from "../communication/http.subscription.service";
import { HttpTenantService } from "../communication/http.tenant.service";
import { NotificationModule } from "../notification/notification.module";
import { MembershipsController } from "./memberships.controller";
import { TenantController } from "./tenant.controller";

@Module({
  imports: [HttpModule, CommunicationModule, NotificationModule],
  controllers: [TenantController, MembershipsController],
  providers: [
    HttpTenantService,
    HttpSubscriptionService,
    AppLogger,
    ConfigService,
    DikeConfigService,
    DikeJwtService,
    KeycloakService,
  ],
  exports: [],
})
export class TenantModule {}
