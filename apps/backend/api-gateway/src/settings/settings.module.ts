import {
  AppLogger,
  DikeConfigService,
  DikeJwtService,
  DikeModule,
} from "@dike/common";
import { ApiGatewayService, AuditModule, KeycloakService, UserFactory } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpProfileService } from "../communication/http.profile.service";
import { ProfileController } from "../profile/profile.controller";
import { ProfileService } from "../profile/profile.service";
import { SettingsMeController } from "./settings.me.controller";
import { UserSettingsService } from "./settings.service";
import { TeamSettingsController } from "./settings.team.controller";

@Module({
  exports: [],
  imports: [HttpModule, AuditModule, DikeModule],
  controllers: [
    SettingsMeController,
    TeamSettingsController,
    ProfileController,
  ],
  providers: [
    UserSettingsService,
    HttpProfileService,
    AppLogger,
    ProfileService,
    ConfigService,
    DikeConfigService,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
    DikeJwtService,
  ],
})
export class SettingsModule {}
