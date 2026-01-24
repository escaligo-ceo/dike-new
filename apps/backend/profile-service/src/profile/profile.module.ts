import { AppLogger, DikeConfigService, DikeJwtService } from "@dike/common";
import { ApiGatewayService, AuditModule, UserFactory, KeycloakService } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { entities } from "../database/entities";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { ProfileInternalController } from "./profile-internal.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    AuditModule,
    HttpModule,
    ConfigModule,
  ],
  providers: [
    ProfileService,
    AppLogger,
    DikeConfigService,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
    DikeJwtService,
  ],
  controllers: [ProfileController, ProfileInternalController],
  exports: [ProfileService],
})
export class ProfileModule {}
