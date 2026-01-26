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
  HttpStatus,
  Post,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  AlreadyRegisteredEmailOptions,
  EmailGenericResponse,
  EmailOptions,
  InviteTeamEmailOptions,
  PasswordResetEmailOptions,
  VerificationEmailOptions,
  WelcomeEmailOptions,
} from "./email.interface";
import { EmailChannel } from "./email.service";

@UseGuards(JwtAuthGuard)
@ApiTags("email")
@Controller("email")
export class EmailController extends BaseController {
  constructor(
    private readonly emailService: EmailChannel,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
  ) {
    super(new AppLogger(EmailController.name), configService, userFactory);
  }

  @Post()
  @Version("1")
  @Audit(AuditCategory.EMAIL, AuditAction.SEND)
  @ApiOperation({ summary: "Invia email generica" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        to: { type: "string", format: "email", description: "Destinatario" },
        subject: { type: "string", description: "Oggetto" },
        text: { type: "string", description: "Testo semplice (opzionale)" },
        html: { type: "string", description: "HTML (opzionale)" },
        from: {
          type: "string",
          format: "email",
          description: "Mittente (opzionale)",
        },
      },
      required: ["to", "subject"],
    },
  })
  async sendGenericEmail(
    @Body() emailOptions: EmailOptions,
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ): Promise<EmailGenericResponse> {
    this.logRequest(
      req,
      `sendGenericEmail called with recipient: ${emailOptions.to}`,
    );
    try {
      await this.emailService.sendEmail(emailOptions);
      this.logger.log(`Generic email sent to ${emailOptions.to}`);

      return {
        success: true,
        message: "Email inviata con successo",
      };
    } catch (error) {
      this.logger.error("Error sending generic email:", error);
      return {
        success: false,
        message: "Errore nell'invio dell'email",
      };
    }
  }

  // @Post("verification")
  // @Version("1")
  // @Audit(AuditCategory.USER, AuditAction.SEND_EMAIL_VERIFICATION)
  // @ApiOperation({ summary: "Invia email di verifica account" })
  // @ApiBody({
  //   schema: {
  //     type: "object",
  //     properties: {
  //       to: {
  //         type: "string",
  //         format: "email",
  //         description: "Email del destinatario",
  //       },
  //       link: { type: "string", description: "Link di verifica" },
  //       username: { type: "string", description: "Nome utente (opzionale)" },
  //     },
  //     required: ["to", "link"],
  //   },
  // })
  // async sendVerificationEmail(
  //   @Body() options: VerificationEmailOptions,
  //   @CurrentUser() loggedUser: LoggedUser,
  //   @Req() req,
  // ): Promise<EmailGenericResponse> {
  //   this.logRequest(
  //     req,
  //     `sendVerificationEmail called with recipient: ${options.to}`,
  //   );
  //   try {
  //     await this.emailService.sendVerificationEmail(loggedUser, options);
  //     this.logger.log(`Verification email sent to ${options.to}`);

  //     return {
  //       success: true,
  //       message: "Email di verifica inviata con successo",
  //     };
  //   } catch (error) {
  //     this.logger.error("Error sending verification email:", error);
  //     return {
  //       success: false,
  //       message: "Errore nell'invio dell'email di verifica",
  //     };
  //   }
  // }

  // @Post("welcome")
  // @Version("1")
  // @Audit(AuditCategory.EMAIL, AuditAction.SEND_WELCOME_EMAIL)
  // @ApiOperation({ summary: "Invia email di benvenuto" })
  // @ApiBody({
  //   schema: {
  //     type: "object",
  //     properties: {
  //       email: {
  //         type: "string",
  //         format: "email",
  //         description: "Email del destinatario",
  //       },
  //       userName: { type: "string", description: "Nome utente" },
  //       loginLink: { type: "string", description: "Link di login (opzionale)" },
  //     },
  //     required: ["email", "userName"],
  //   },
  // })
  // async sendWelcomeEmail(
  //   @Body() options: WelcomeEmailOptions,
  //   @CurrentUser() loggedUser: LoggedUser,
  //   @Req() req,
  // ): Promise<EmailGenericResponse> {
  //   this.logRequest(
  //     req,
  //     `sendWelcomeEmail called with recipient: ${options.email}`,
  //   );
  //   try {
  //     await this.emailService.sendWelcomeEmail(loggedUser, options);
  //     this.logger.log(`Welcome email sent to ${options.email}`);

  //     return {
  //       success: true,
  //       message: "Email di benvenuto inviata con successo",
  //     };
  //   } catch (error) {
  //     this.logger.error("Error sending welcome email:", error);
  //     return {
  //       success: false,
  //       message: "Errore nell'invio dell'email di benvenuto",
  //     };
  //   }
  // }

  // @Post("password-reset")
  // @Version("1")
  // @Audit(AuditCategory.USER, AuditAction.SEND_PASSWORD_RESET)
  // @ApiOperation({ summary: "Invia email di reset password" })
  // @ApiBody({
  //   schema: {
  //     type: "object",
  //     properties: {
  //       email: {
  //         type: "string",
  //         format: "email",
  //         description: "Email del destinatario",
  //       },
  //       resetLink: { type: "string", description: "Link di reset password" },
  //       userName: { type: "string", description: "Nome utente (opzionale)" },
  //     },
  //     required: ["email", "resetLink"],
  //   },
  // })
  // async sendPasswordResetEmail(
  //   @Body() options: PasswordResetEmailOptions,
  //   @CurrentUser() loggedUser: LoggedUser,
  //   @Req() req,
  // ): Promise<EmailGenericResponse> {
  //   this.logRequest(
  //     req,
  //     `sendPasswordResetEmail called with recipient: ${options.email}`,
  //   );
  //   try {
  //     await this.emailService.sendPasswordResetEmail(loggedUser, options);
  //     this.logger.log(`Password reset email sent to ${options.email}`);

  //     return {
  //       success: true,
  //       message: "Email di reset password inviata con successo",
  //     };
  //   } catch (error) {
  //     this.logger.error("Error sending password reset email:", error);
  //     return {
  //       success: false,
  //       message: "Errore nell'invio dell'email di reset password",
  //     };
  //   }
  // }

  @Post("test-smtp-connection")
  @Version("1")
  @Audit(AuditCategory.EMAIL, AuditAction.TEST_CONNECTION)
  @ApiOperation({ summary: "Test connessione SMTP" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Test completato",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean" },
        message: { type: "string" },
      },
    },
  })
  async testConnection(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ): Promise<EmailGenericResponse> {
    this.logRequest(req, `testConnection`);
    try {
      await this.emailService.testConnection();

      return {
        success: true,
        message: "Connessione SMTP funzionante",
      };
    } catch (error) {
      this.logger.error("SMTP connection test failed:", error);
      return {
        success: false,
        message: "Connessione SMTP non funzionante",
      };
    }
  }

  // @Post("already-registered")
  // @Audit(AuditCategory.EMAIL, AuditAction.SEND_ALREADY_REGISTERED_EMAIL)
  // @Version("1")
  // @ApiOperation({ summary: "Invia email di verifica account" })
  // @ApiBody({
  //   schema: {
  //     type: "object",
  //     properties: {
  //       to: {
  //         type: "string",
  //         format: "email",
  //         description: "Email del destinatario",
  //       },
  //       link: { type: "string", description: "Link di verifica" },
  //       username: { type: "string", description: "Nome utente (opzionale)" },
  //     },
  //     required: ["to", "link"],
  //   },
  // })
  // async sendAlreadyRegisteredEmail(
  //   @Body() options: AlreadyRegisteredEmailOptions,
  //   @CurrentUser() loggedUser: LoggedUser,
  //   @Req() req,
  // ): Promise<EmailGenericResponse> {
  //   this.logRequest(
  //     req,
  //     `sendAlreadyRegisteredEmail called with recipient: ${options.to}`,
  //   );
  //   try {
  //     await this.emailService.sendAlreadyRegisteredEmail(loggedUser, options);
  //     this.logger.log(`Already registered email sent to ${options.to}`);

  //     return {
  //       success: true,
  //       message: "Email di verifica inviata con successo",
  //     };
  //   } catch (error) {
  //     this.logger.error("Error sending verification email:", error);
  //     return {
  //       success: false,
  //       message: "Errore nell'invio dell'email di verifica",
  //     };
  //   }
  // }

  // @Post("invite-team")
  // @Version("1")
  // @Audit(AuditCategory.EMAIL, AuditAction.SEND_INVITE_TEAM_MEMBERSHIP)
  // @ApiOperation({ summary: "Invia email di invito al team" })
  // async sendInviteTeamEmail(
  //   @Req() req,
  //   @Body() options: InviteTeamEmailOptions,
  //   @CurrentUser() loggedUser: LoggedUser,
  // ): Promise<EmailGenericResponse> {
  //   this.logRequest(
  //     req,
  //     `sendInviteTeamEmail called with recipient: ${options.to}`,
  //   );
  //   try {
  //     const user = req.user;
  //     const { tenantId } = loggedUser;

  //     await this.emailService.sendInviteTeamEmail(
  //       loggedUser,
  //       options,
  //       tenantId,
  //     );
  //     this.logger.log(`Invite team email sent to ${options.to}`);

  //     return {
  //       success: true,
  //       message: "Email di invito al team inviata con successo",
  //     };
  //   } catch (error) {
  //     this.logger.error("Error sending invite team email:", error);
  //     return {
  //       success: false,
  //       message: "Errore nell'invio dell'email di invito al team",
  //     };
  //   }
  // }
}
