import { AppLogger, DikeJwtService, DikeConfigService } from "@dike/common";
import {
  ApiGatewayService,
  AuditService,
  HttpAuditService,
  UserFactory, KeycloakService,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { entities } from "../database/entities";
import { PlanModule } from "../plan/plan.module";
import { TenantController } from "./tenant.controller";
import { TenantService } from "./tenant.service";
import { InternalTenantController } from "./internal-tenant.controller";

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature(entities), PlanModule],
  providers: [
    TenantService,
    ApiGatewayService,
    AppLogger,
    DikeConfigService,
    ConfigService,
    AuditService,
    HttpAuditService,
    KeycloakService,
    UserFactory,
    DikeJwtService,
  ],
  controllers: [TenantController, InternalTenantController],
  exports: [TenantService],
})
export class TenantModule {}
