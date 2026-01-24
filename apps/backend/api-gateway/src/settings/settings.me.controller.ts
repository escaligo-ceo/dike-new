import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  inspect,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import { BaseController, UserFactory } from "@dike/communication";
import { Body, Controller, Post, Req } from "@nestjs/common";
import { UserSettingsService } from "./settings.service";

@Controller("settings/me")
export class SettingsMeController extends BaseController {
  constructor(
    private readonly settingsService: UserSettingsService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory
  ) {
    super(new AppLogger(SettingsMeController.name), configService, userFactory);
  }

  @Post()
  async updateSettings(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @Body() updateSettingsDto: any,
    @Req() req
  ) {
    this.logRequest(req, `Received request to update user settings`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      req.headers.authorization
    );
    const response = await this.settingsService.updateUserSettings(
      loggedUser,
      updateSettingsDto
    );
    this.logger.debug(
      `User settings updated successfully: ${inspect(response)}`
    );
    return response;
  }

  @Post("account")
  async updateAccountSettings(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Body() updateAccountSettingsDto: any,
    @Req() req
  ): Promise<void> {
    this.logRequest(req, `Updating account settings`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const response = await this.settingsService.updateAccountSettings(
      loggedUser,
      updateAccountSettingsDto
    );
    this.logger.debug(
      `Account settings updated successfully: ${inspect(response)}`
    );
    return response;
  }

  @Post("notifications")
  async updateNotificationSettings(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Body() updateNotificationSettingsDto: any,
    @Req() req
  ): Promise<void> {
    this.logRequest(req, `Updating notification settings`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const response = await this.settingsService.updateNotificationSettings(
      loggedUser,
      updateNotificationSettingsDto
    );
    this.logger.debug(`Notification settings updated successfully`);
    return response;
  }

  @Post("sessions")
  async postSessions(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Body() updateSessionSettingsDto: any,
    @Req() req
  ): Promise<void> {
    this.logRequest(req, `Updating session settings`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const response = await this.settingsService.updateSessionSettings(
      loggedUser,
      updateSessionSettingsDto
    );
    this.logger.debug(
      `Session settings updated successfully: ${inspect(response)}`
    );
    return response;
  }

  @Post("teams")
  async postTeams(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Body() dto: any,
    @Req() req
  ): Promise<void> {
    this.logRequest(req, `Updating team settings`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const response = await this.settingsService.updateTeamSettings(
      loggedUser,
      dto
    );
    this.logger.debug(
      `Team settings updated successfully: ${inspect(response)}`
    );
    return response;
  }

  @Post("api-keys")
  async postApiKeys(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Body() dto: any,
    @Req() req
  ): Promise<void> {
    this.logRequest(req, `Updating API keys settings`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const response = await this.settingsService.updateApiKeysSettings(
      loggedUser,
      dto
    );
    this.logger.debug(
      `API keys settings updated successfully: ${inspect(response)}`
    );
    return response;
  }
}
