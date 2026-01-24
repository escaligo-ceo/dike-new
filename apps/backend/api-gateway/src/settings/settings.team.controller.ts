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

@Controller("settings/team")
export class TeamSettingsController extends BaseController {
  constructor(
    private readonly settingsService: UserSettingsService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory
  ) {
    super(
      new AppLogger(TeamSettingsController.name),
      configService,
      userFactory
    );
  }

  @Post("update")
  async updateSettings(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Body() updateSettingsDto: any,
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
      updateSettingsDto
    );
    this.logger.debug(
      `Team settings updated successfully: ${inspect(response)}`
    );
    return response;
  }
}
