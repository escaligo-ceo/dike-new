import { AppLogger, DikeConfigService, DikeJwtService, DikeModule } from "@dike/common";
import { ApiGatewayService, AuditModule, UserFactory, KeycloakService, JwtAuthGuard } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
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
    DikeModule,
  ],
  providers: [
    ProfileService,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
  ],
  controllers: [ProfileController, ProfileInternalController],
  exports: [ProfileService],
})
export class ProfileModule {}
