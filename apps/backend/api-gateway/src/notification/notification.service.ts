import { AppLogger, Invite } from "@dike/common";
import { Injectable } from "@nestjs/common";
import { HttpNotificationService } from "../communication/http.notification.service";
import { LoggedUser } from "@dike/communication";

@Injectable()
export class NotificationService {
  constructor(
    private readonly httpNotificationService: HttpNotificationService,
    private readonly logger: AppLogger
  ) {
    this.logger = new AppLogger(NotificationService.name);
  }

  async sendTeamInviteEmail(loggedUser: LoggedUser, invite: Invite): Promise<void> {
    await this.httpNotificationService.sendTeamInviteEmail(loggedUser, invite);
  }

  async sendAlreadyRegisteredEmail(
    loggedUser: LoggedUser,
    email: string
  ): Promise<void> {
    await this.httpNotificationService.sendAlreadyRegisteredEmail(
      loggedUser,
      email
    );
  }
}
