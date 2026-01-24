import { AppLogger, Token } from "@dike/common";
import { Injectable } from "@nestjs/common";
import {
  AlreadyRegisteredEmailOptions,
  EmailGenericResponse,
  EmailOptions,
  InviteTeamEmailOptions,
  PasswordResetEmailOptions,
  VerificationEmailOptions,
  WelcomeEmailOptions,
} from "../email/email.interface";
import { EmailChannel } from "../email/email.service";
import { NotificationChannel, NotificationType } from "./notification.type";
import { SendNotificationDto } from "./send-notification.dto";
import { LoggedUser } from "@dike/communication";

@Injectable()
export class NotificationService {
  constructor(
    private readonly emailChannel: EmailChannel,
    private readonly logger: AppLogger
  ) {}

  // Invia una notifica su uno o più canali (email, sms, system)
  async sendNotification(
    loggedUser: LoggedUser,
    dto: SendNotificationDto
  ): Promise<EmailGenericResponse> {
    const { type, channels, payload } = dto;
    let results: EmailGenericResponse[] = [];

    for (const channel of channels) {
      if (channel === NotificationChannel.EMAIL) {
        // Dispatch to the correct email method based on type
        switch (type) {
          case NotificationType.ALREADY_REGISTERED:
            results.push(
              await this.sendAlreadyRegistered(
                loggedUser,
                payload as AlreadyRegisteredEmailOptions
              )
            );
            break;
          case NotificationType.VERIFICATION:
            results.push(
              await this.sendVerification(
                loggedUser,
                payload as VerificationEmailOptions
              )
            );
            break;
          case NotificationType.WELCOME:
            results.push(
              await this.sendWelcome(loggedUser, payload as WelcomeEmailOptions)
            );
            break;
          case NotificationType.PASSWORD_RESET:
            results.push(
              await this.sendPasswordReset(
                loggedUser,
                payload as PasswordResetEmailOptions
              )
            );
            break;
          case NotificationType.INVITE_TEAM: // decommenta se serve
            results.push(
              await this.sendInviteTeam(
                loggedUser,
                payload as InviteTeamEmailOptions
              )
            );
            break;
          default:
            results.push(
              await this.sendGeneric(loggedUser, payload as EmailOptions)
            );
        }
      } else if (channel === NotificationChannel.SMS) {
        // Qui andrebbe la logica per invio SMS (stub)
        this.logger.log(
          `[SMS] Notifica ${type} a ${payload.to || payload.phone}`
        );
        results.push({ success: true, message: "SMS inviato (stub)" });
      } else if (channel === NotificationChannel.SYSTEM) {
        // Qui andrebbe la logica per salvataggio su DB (stub)
        this.logger.log(
          `[SYSTEM] Notifica ${type} a ${payload.to || payload.userId}`
        );
        results.push({
          success: true,
          message: "Notifica di sistema salvata (stub)",
        });
      } else {
        results.push({
          success: false,
          message: `Canale ${channel} non supportato`,
        });
      }
    }

    // Ritorna successo se almeno una notifica è andata a buon fine
    const atLeastOneSuccess = results.some((r) => r.success);
    return {
      success: atLeastOneSuccess,
      message: results.map((r) => r.message).join(" | "),
    };
  }

  async sendGeneric(
    loggedUser: LoggedUser,
    emailOptions: EmailOptions
  ): Promise<EmailGenericResponse> {
    try {
      await this.emailChannel.sendEmail(emailOptions);
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

  async sendVerification(
    loggedUser: LoggedUser,
    options: VerificationEmailOptions
  ): Promise<EmailGenericResponse> {
    try {
      await this.emailChannel.sendVerificationEmail(loggedUser, options);
      this.logger.log(`Verification email sent to ${options.to}`);
      return {
        success: true,
        message: "Email di verifica inviata con successo",
      };
    } catch (error) {
      this.logger.error("Error sending verification email:", error);
      return {
        success: false,
        message: "Errore nell'invio dell'email di verifica",
      };
    }
  }

  async sendWelcome(
    loggedUser: LoggedUser,
    options: WelcomeEmailOptions
  ): Promise<EmailGenericResponse> {
    try {
      await this.emailChannel.sendWelcomeEmail(loggedUser, options);
      this.logger.log(`Welcome email sent to ${options.email}`);
      return {
        success: true,
        message: "Email di benvenuto inviata con successo",
      };
    } catch (error) {
      this.logger.error("Error sending welcome email:", error);
      return {
        success: false,
        message: "Errore nell'invio dell'email di benvenuto",
      };
    }
  }

  async sendPasswordReset(
    loggedUser: LoggedUser,
    options: PasswordResetEmailOptions
  ): Promise<EmailGenericResponse> {
    try {
      await this.emailChannel.sendPasswordResetEmail(loggedUser, options);
      this.logger.log(`Password reset email sent to ${options.email}`);
      return {
        success: true,
        message: "Email di reset password inviata con successo",
      };
    } catch (error) {
      this.logger.error("Error sending password reset email:", error);
      return {
        success: false,
        message: "Errore nell'invio dell'email di reset password",
      };
    }
  }

  async sendInviteTeam(
    loggedUser: LoggedUser,
    options: InviteTeamEmailOptions
  ): Promise<EmailGenericResponse> {
    try {
      await this.emailChannel.sendInviteTeamEmail(loggedUser, options);
      this.logger.log(`Invite team email sent to ${options.to}`);
      return {
        success: true,
        message: "Email di invito al team inviata con successo",
      };
    } catch (error) {
      this.logger.error("Error sending invite team email:", error);
      return {
        success: false,
        message: "Errore nell'invio dell'email di invito al team",
      };
    }
  }

  async testConnection(
    loggedUser: LoggedUser
  ): Promise<EmailGenericResponse> {
    try {
      await this.emailChannel.testConnection();
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

  async sendAlreadyRegistered(
    loggedUser: LoggedUser,
    options: AlreadyRegisteredEmailOptions
  ): Promise<EmailGenericResponse> {
    try {
      await this.emailChannel.sendAlreadyRegisteredEmail(loggedUser, options);
      this.logger.log(`Already registered email sent to ${options.to}`);
      return {
        success: true,
        message: "Email di verifica inviata con successo",
      };
    } catch (error) {
      this.logger.error("Error sending verification email:", error);
      return {
        success: false,
        message: "Errore nell'invio dell'email di verifica",
      };
    }
  }
}
