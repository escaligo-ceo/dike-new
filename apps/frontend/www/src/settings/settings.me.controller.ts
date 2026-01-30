import {
  AppLogger,
  AuthorizationBearer,
  inspect,
  OriginIp,
  OriginUserAgent,
  Token,
} from "@dike/common";
import { Controller, Get, Post, Render, Req, UseGuards } from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { JwtAuthGuard } from "@dike/communication";

@UseGuards(JwtAuthGuard)
@Controller("settings/user")
export class SettingsMeController {
  constructor(
    private readonly profileService: SettingsService,
    private readonly logger: AppLogger
  ) {}

  @Get()
  @Render("settings")
  getSettings(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ) {
    const accessToken = req.cookies?.access_token || req.query?.token || authorization;
    const tokenDto = new Token(originIp, originUserAgent, accessToken);
    return {
      title: "Settings",
      description: "Manage your application settings here.",
    };
  }

  @Post()
  async postSettings(dto: any) {
    // // Logic to handle settings update
    // return { message: 'Settings updated successfully' };

    this.logger.log("Rendering registration page");
    const response = await this.profileService.updateMe(dto);
    this.logger.debug(`User registered successfully: ${inspect(response)}`);
    return response;
  }

  @Get("account")
  @Render("settings/user/account")
  getAccount() {
    return {
      title: "Accounts",
      description: "Manage your application account here.",
    };
  }

  @Post("account")
  async postAccount(dto: any) {
    this.logger.log("Updating account settings");
    const response = await this.profileService.updateAccount(dto);
    this.logger.debug(`Account updated successfully: ${inspect(response)}`);
    return response;
  }

  @Get("notifications")
  @Render("settings/user/notifications")
  getNotifications() {
    return {
      title: "Notifications",
      description: "Manage your application notifications here.",
    };
  }

  @Post("notifications")
  async postNotifications(dto: any) {
    this.logger.log("Updating notification settings");
    const response = await this.profileService.updateNotifications(dto);
    this.logger.debug(
      `Notifications updated successfully: ${inspect(response)}`
    );
    return response;
  }

  @Get("sessions")
  @Render("settings/user/sessions")
  getSessions() {
    return {
      title: "Sessions",
      description: "Manage your application sessions here.",
    };
  }

  @Post("sessions")
  async postSessions(dto: any) {
    this.logger.log("Updating session settings");
    const response = await this.profileService.updateSessions(dto);
    this.logger.debug(`Sessions updated successfully: ${inspect(response)}`);
    return response;
  }

  @Get("team")
  @Render("settings/user/teams")
  getTeams() {
    return {
      title: "Teams",
      description: "Manage your application teams here.",
    };
  }

  @Post("team")
  async postTeams(dto: any) {
    this.logger.log("Updating team settings");
    const response = await this.profileService.updateTeam(dto);
    this.logger.debug(
      `Team settings updated successfully: ${inspect(response)}`
    );
    return response;
  }

  @Get("api-keys")
  @Render("settings/user/api-keys")
  getApiKeys() {
    return {
      title: "API Keys",
      description: "Manage your application API keys here.",
    };
  }

  @Post("api-keys")
  async postApiKeys(dto: any) {
    this.logger.log("Updating API keys settings");
    // Logic to handle API keys update
    // return { message: 'API keys updated successfully' };

    const response = await this.profileService.updateApiKeys(dto);
    this.logger.debug(`API keys updated successfully: ${inspect(response)}`);
    return response;
  }
}
