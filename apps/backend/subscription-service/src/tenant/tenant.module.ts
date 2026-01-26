import { AppLogger, DikeJwtService, DikeConfigService, DikeModule } from "@dike/common";
import {
  ApiGatewayService,
  AuditService,
  AuditModule,
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
  imports: [DikeModule, AuditModule, HttpModule, TypeOrmModule.forFeature(entities), PlanModule],
  providers: [
    TenantService,
    ConfigService,
  ],
  controllers: [TenantController, InternalTenantController],
  exports: [TenantService],
})
export class TenantModule {}
