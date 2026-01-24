import { Injectable } from '@nestjs/common';
import { HttpProfileService } from '../communication/http.profile.service';
import { AppLogger } from '@dike/common';
import { LoggedUser } from '@dike/communication';

@Injectable()
export class UserSettingsService {
	constructor(
		private readonly httpProfileService: HttpProfileService,
		private readonly logger: AppLogger,
	) {
    this.logger = new AppLogger(UserSettingsService.name);
  }

	async updateUserSettings(
    loggedUser: LoggedUser,
    updateSettingsDto: any
  ): Promise<void> {
		// const response = await this.httpProfileService.updateUserSettings(updateSettingsDto);
		// this.logger.log(`User settings updated successfully: ${inspect(response)}`);
		// return response;
	}

	async updateAccountSettings(
    loggedUser: LoggedUser,
    updateAccountSettingsDto: any
  ): Promise<void> {
		// const response = await this.httpProfileService.updateAccountSettings(updateAccountSettingsDto);
		// return response;
	}

	async updateNotificationSettings(
    loggedUser: LoggedUser,
    updateNotificationSettingsDto: any
  ): Promise<void> {
		// const response = await this.httpProfileService.updateNotificationSettings(updateNotificationSettingsDto);
		// return response;
	}

	async updateSessionSettings(
    loggedUser: LoggedUser,
    updateSessionSettingsDto: any
  ): Promise<void> {
		// const response = await this.httpProfileService.updateSessionSettings(updateSessionSettingsDto);
		// return response;
	}

	async updateTeamSettings(
    loggedUser: LoggedUser,
    updateTeamSettingsDto: any
  ): Promise<void> {
		// const response = await this.httpProfileService.updateTeamSettings(updateTeamSettingsDto);
		// return response;
	}

	async updateApiKeysSettings(
    loggedUser: LoggedUser,
    updateApiKeysSettingsDto: any
  ): Promise<void> {
		// const response = await this.httpProfileService.updateApiKeysSettings(updateApiKeysSettingsDto);
		// return response;
	}
}
