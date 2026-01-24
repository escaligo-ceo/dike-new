import { AppLogger, DikeJwtService, DikeConfigService } from "@dike/common";
import { ApiGatewayService, KeycloakService, UserFactory } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { entities } from "../database/entities";
import { FeatureController } from "./feature.controller";
import { FeatureService } from "./feature.service";

@Module({
  imports: [TypeOrmModule.forFeature(entities), HttpModule],
  controllers: [FeatureController],
  providers: [
    FeatureService,
    AppLogger,
    DikeConfigService,
    ConfigService,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
    DikeJwtService,
  ],
  exports: [FeatureService],
})
export class FeatureModule {}
