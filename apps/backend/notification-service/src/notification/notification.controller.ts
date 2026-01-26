import { AppLogger, CurrentUser, DikeConfigService } from "@dike/common";
import {
  Audit,
  AuditAction,
  AuditCategory,
  BaseController,
  JwtAuthGuard,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  AlreadyRegisteredEmailOptions,
  EmailGenericResponse,
  EmailOptions,
  PasswordResetEmailOptions,
  VerificationEmailOptions,
  WelcomeEmailOptions,
} from "../channels/email/email.interface";
import { EmailChannel } from "../channels/email/email.service";
import { NotificationService } from "./notification.service";
import { SendNotificationDto } from "./send-notification.dto";

@ApiTags("notification")
@Controller("notification")
@UseGuards(JwtAuthGuard)
export class NotificationController extends BaseController {
  constructor(
    private readonly notificationService: NotificationService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    private readonly emailService: EmailChannel,
    protected readonly userFactory: UserFactory,
  ) {
    super(
      new AppLogger(NotificationController.name),
      configService,
      userFactory,
    );
  }

  // @Post()
  // @Version("1")
  // @Audit(AuditCategory.NOTIFICATION, AuditAction.SEND)
  // @ApiOperation({
  //   summary: "Invia una notifica su uno o più canali (email, sms, system)",
  // })
  // async sendNotification(
  //   @CurrentUser() loggedUser: LoggedUser,
  //   @Body() dto: SendNotificationDto,
  //   @Req() req,
  // ): Promise<EmailGenericResponse> {
  //   this.logRequest(req, `sendNotification`);
  //   this.logger.log(
  //     `Invio notifica di tipo ${dto.type} sui canali: ${dto.channels.join(", ")}`,
  //   );
  //   return this.notificationService.sendNotification(loggedUser, dto);
  // }

  @Post("email")
  @Version("1")
  @Audit(AuditCategory.EMAIL, AuditAction.SEND)
  @ApiOperation({ summary: "Invia email generica" })
  async sendGeneric(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() emailOptions: EmailOptions,
    @Req() req,
  ): Promise<EmailGenericResponse> {
    this.logRequest(req, `sendGeneric`);
    return this.notificationService.sendGeneric(loggedUser, emailOptions);
  }

  // @Post("verification")
  // @Version("1")
  // @Audit(AuditCategory.EMAIL, AuditAction.SEND_EMAIL_VERIFICATION)
  // @ApiOperation({ summary: "Invia email di verifica account" })
  // async sendVerification(
  //   @CurrentUser() loggedUser: LoggedUser,
  //   @Body() options: VerificationEmailOptions,
  //   @Req() req,
  // ): Promise<EmailGenericResponse> {
  //   this.logRequest(req, `sendVerification`);
  //   return this.notificationService.sendVerification(loggedUser, options);
  // }

  // @Post("welcome")
  // @Version("1")
  // @Audit(AuditCategory.EMAIL, AuditAction.SEND_WELCOME_EMAIL)
  // @ApiOperation({ summary: "Invia email di benvenuto" })
  // async sendWelcome(
  //   @CurrentUser() loggedUser: LoggedUser,
  //   @Body() options: WelcomeEmailOptions,
  //   @Req() req,
  // ): Promise<EmailGenericResponse> {
  //   this.logRequest(req, `sendWelcome`);
  //   return this.notificationService.sendWelcome(loggedUser, options);
  // }

  // @Post("password-reset")
  // @Version("1")
  // @Audit(AuditCategory.EMAIL, AuditAction.SEND_PASSWORD_RESET)
  // @ApiOperation({ summary: "Invia email di reset password" })
  // async sendPasswordReset(
  //   @CurrentUser() loggedUser: LoggedUser,
  //   @Body() options: PasswordResetEmailOptions,
  //   @Req() req,
  // ): Promise<EmailGenericResponse> {
  //   this.logRequest(req, `sendPasswordReset`);
  //   return this.notificationService.sendPasswordReset(loggedUser, options);
  // }

  @Post("test-smtp-connection")
  @Version("1")
  @Audit(AuditCategory.EMAIL, AuditAction.TEST_CONNECTION)
  @ApiOperation({ summary: "Test connessione SMTP" })
  async testConnection(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ): Promise<EmailGenericResponse> {
    this.logRequest(req, `testConnection`);
    return this.notificationService.testConnection(loggedUser);
  }

  // @Post("already-registered")
  // @Version("1")
  // @Audit(AuditCategory.EMAIL, AuditAction.SEND_ALREADY_REGISTERED_EMAIL)
  // @ApiOperation({ summary: "Invia email di verifica account" })
  // async sendAlreadyRegistered(
  //   @CurrentUser() loggedUser: LoggedUser,
  //   @Body() options: AlreadyRegisteredEmailOptions,
  //   @Req() req,
  // ): Promise<EmailGenericResponse> {
  //   this.logRequest(req, `sendAlreadyRegistered`);
  //   return this.notificationService.sendAlreadyRegistered(loggedUser, options);
  // }
}
