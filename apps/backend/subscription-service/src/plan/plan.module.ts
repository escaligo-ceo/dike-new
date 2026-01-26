import { AppLogger, DikeJwtService, DikeConfigService, DikeModule } from "@dike/common";
import {
  ApiGatewayService,
  AuditModule,
  KeycloakService,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { entities } from "../database/entities";
import { FeatureModule } from "../feature/feature.module";
import { PlanController } from "./plan.controller";
import { PlanService } from "./plan.service";

@Module({
  imports: [
    DikeModule,
    TypeOrmModule.forFeature(entities),
    FeatureModule,
    AuditModule,
    HttpModule,
    ConfigModule,
  ],
  controllers: [PlanController],
  providers: [
    PlanService,
    ConfigService,
  ],
  exports: [PlanService],
})
export class PlanModule {}
