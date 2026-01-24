import { AppLogger, DikeConfigService} from "@dike/common";
import {
  ApiGatewayService,
  AuditModule,
  KeycloakService,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { entities } from "../database/entities";
import { MappingsController } from "./mappings.controller";
import { MappingsService } from "./mappings.service";

@Module({
  imports: [TypeOrmModule.forFeature(entities), AuditModule, HttpModule],
  providers: [
    MappingsService,
    AppLogger,
    DikeConfigService,
    ConfigService,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
  ],
  controllers: [MappingsController],
  exports: [MappingsService],
})
export class MappingsModule {}
