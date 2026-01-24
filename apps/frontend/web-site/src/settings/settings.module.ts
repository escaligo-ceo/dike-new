import { AppLogger, DikeJwtService, DikeModule } from "@dike/common";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { SettingsMeController } from "./settings.me.controller";
import { SettingsService } from "./settings.service";
import { SettingsTeamController } from "./settings.team.controller";
import { KeycloakService } from "@dike/communication";

@Module({
  imports: [DikeModule, HttpModule],
  controllers: [SettingsMeController, SettingsTeamController],
  providers: [SettingsService, AppLogger, KeycloakService, DikeJwtService],
})
export class SettingsModule {}
