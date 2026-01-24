import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  inspect,
  OriginIp,
  OriginUserAgent,
  VerificationDto,
} from "@dike/common";
import {
  AuditService,
  BaseController,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import {
  Body,
  Controller,
  HttpException,
  InternalServerErrorException,
  Post,
  Req,
} from "@nestjs/common";
import axios from "axios";
import { HttpNotificationService } from "../communication/http.notification.service";

@Controller("notification")
export class NotificationController extends BaseController {
  constructor(
    private readonly httpNotificationService: HttpNotificationService,
    private readonly auditService: AuditService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory
  ) {
    super(
      new AppLogger(NotificationController.name),
      configService,
      userFactory
    );
  }

  @Post("verification")
  async verification(
    @Body() dto: VerificationDto,
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authentication: string,
    @Req() req
  ): Promise<void> {
    this.logRequest(req, `Sending email verification`);
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authentication,
    );
    try {
      await this.httpNotificationService.sendEmailVerification(loggedUser, dto);
      return;
    } catch (error) {
      this.auditService.safeLog(
        loggedUser,
        "SEND_EMAIL_VERIFICATION",
        `Failed to update profile for user ID: ${loggedUser.id}`,
        dto
      );

      // if user profile does not exist, log the error and create a new profile
      // this.auditService.error(`Failed to sent verification email to address: ${dto.email}`, error, DikeServiceName.API_GATEWAY);

      if (axios.isAxiosError(error) && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }

      throw new InternalServerErrorException("Errore interno"); // FIXME: definire meglio l'errore
    }
  }
}
