import { AppLogger, BaseUrl, EnvNotFoundException, Token } from "@dike/common";
import { ApiGatewayService, LoggedUser } from "@dike/communication";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import {
  AlreadyRegisteredEmailOptions,
  EmailOptions,
  InviteTeamEmailOptions,
  PasswordResetEmailOptions,
  VerificationEmailOptions,
  WelcomeEmailOptions,
} from "./email.interface";

@Injectable()
export class EmailChannel implements OnModuleInit {
  private transporter: nodemailer.Transporter;
  private readonly smtpConfig = {
    host: process.env.SMTP_HOST || "smtps.aruba.it",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "noreply@escaligo.it",
      pass: process.env.SMTP_PASSWORD || "F&lWZ8FwU4CnM6",
    },
  };
  private readonly frontendServiceParams: BaseUrl;

  constructor(
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
    // private readonly templateLoader: TemplateLoaderService, // FIXME: da sistemare quando si integra TemplateLoaderService
    private readonly apiGatewayService: ApiGatewayService
  ) {
    const frontendServiceUrl = this.configService.get<string>("FRONTEND_URL");
    if (!frontendServiceUrl) {
      throw new EnvNotFoundException("FRONTEND_URL");
    }
    this.frontendServiceParams = new BaseUrl(frontendServiceUrl);
    this.logger = new AppLogger(EmailChannel.name);
  }

  public get frontendBaseUrl(): string {
    const { protocol, host, port, path } = this.frontendServiceParams;
    return `${protocol}://${host}:${port}` + (path ? `/${path}` : "");
  }

  async onModuleInit() {
    this.logger.log("🔧 EmailService initialization started...");

    try {
      // Create transporter
      this.transporter = nodemailer.createTransport(this.smtpConfig);

      // Test connection
      await this.testConnection();

      this.logger.log("✅ EmailService initialized successfully");
    } catch (error) {
      this.logger.error("❌ EmailService initialization failed:", error);
      throw error;
    }
  }

  /**
   * Test SMTP connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log("📧 SMTP connection verified successfully");
      return true;
    } catch (error) {
      this.logger.error("📧 SMTP connection failed:", error);
      throw error;
    }
  }

  /**
   * Send generic email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from:
          options.from || process.env.SMTP_FROM || this.smtpConfig.auth.user,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `📧 Email sent successfully to ${options.to}: ${result.messageId}`
      );
    } catch (error) {
      this.logger.error(`📧 Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  // /**
  //  * Send verification email
  //  */
  // async sendVerificationEmail(
  //   loggedUser: LoggedUser,
  //   options: VerificationEmailOptions
  // ): Promise<void> {
  //   try {
  //     await this.sendEmailWithTenantTemplate(loggedUser, "verification", {
  //       to: options.to,
  //       variables: {
  //         username: options.username,
  //         verificationLink:
  //           options.link || `${this.frontendBaseUrl}/verify-email`,
  //       },
  //     });
  //   } catch (error) {
  //     // Fallback al template hardcoded
  //     this.logger.warn(
  //       `⚠️ Template file non disponibile, uso template hardcoded per verification`
  //     );
  //     await this.sendVerificationEmail(loggedUser, options);
  //   }
  // }

  // /**
  //  * Send welcome email
  //  */
  // async sendWelcomeEmail(loggedUser: LoggedUser, options: WelcomeEmailOptions): Promise<void> {
  //   try {
  //     await this.sendEmailWithTenantTemplate(loggedUser, "welcome", {
  //       to: options.email,
  //       variables: {
  //         username: options.username,
  //         loginLink: options.loginLink || `${this.frontendBaseUrl}/login`,
  //       },
  //     });
  //   } catch (error) {
  //     // Fallback al template hardcoded
  //     this.logger.warn(
  //       `⚠️ Template file non disponibile, uso template hardcoded per welcome`
  //     );
  //     await this.sendWelcomeEmail(loggedUser, options);
  //   }
  // }

  // /**
  //  * Send password reset email
  //  */
  // async sendPasswordResetEmail(
  //   loggedUser: LoggedUser,
  //   options: PasswordResetEmailOptions
  // ): Promise<void> {
  //   try {
  //     await this.sendEmailWithTenantTemplate(loggedUser, "password-reset", {
  //       to: options.email,
  //       variables: {
  //         username: options.username,
  //         resetLink: options.resetLink || `${this.frontendBaseUrl}/login`,
  //       },
  //     });
  //   } catch (error) {
  //     // Fallback al template hardcoded
  //     this.logger.warn(
  //       `⚠️ Template file non disponibile, uso template hardcoded per password-reset`
  //     );
  //     await this.sendPasswordResetEmail(loggedUser, options);
  //   }
  // }

  // /**
  //  * Send invite team member email
  //  */
  // async sendInviteTeamEmail(
  //   loggedUser: LoggedUser,
  //   options: InviteTeamEmailOptions,
  //   tenantId?: string
  // ): Promise<void> {
  //   try {
  //     const inviteEmailOptions = {
  //       to: options.to,
  //       variables: {
  //         teamName: options.teamName,
  //         inviteLink: options.inviteLink || `${this.frontendBaseUrl}/invite`,
  //       },
  //     };

  //     if (
  //       tenantId &&
  //       (await this.apiGatewayService.isFeatureEnabled(
  //         loggedUser,
  //         tenantId,
  //         "custom-email-templates"
  //       ))
  //     ) {
  //       await this.sendEmailWithTenantTemplate(
  //         loggedUser,
  //         "invite-team",
  //         inviteEmailOptions
  //       );
  //     } else {
  //       await this.sendEmailWithSystemTemplate("invite-team", options);
  //     }
  //   } catch (error) {
  //     // Fallback al template hardcoded
  //     this.logger.warn(
  //       `⚠️ Template file non disponibile, uso template hardcoded per invite-team`
  //     );
  //     throw new Error("");
  //     // await this.sendInviteTeamEmail(options);
  //   }
  // }

  /**
   * Send email using file-based tenant template
   */
  async sendEmailWithSystemTemplate(
    templateName: string,
    options: {
      to: string;
      subject?: string;
      variables?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      // // Carica il template da file
      // const template = await this.templateLoader.loadSystemTemplate({
      //   templateName,
      //   variables: options.variables,
      // });

      // // Prova a ottenere i contenuti dai file
      // const htmlContent =
      //   template.getByExtension("html") || template.getByExtension("htm");
      // const textContent =
      //   template.getByFilename("txt") ||
      //   template.getByFilename("text") ||
      //   template.getByExtension("txt") ||
      //   template.getByExtension("text");
      // const subjectContent = template.getByExtension("subject");

      // // Usa il subject dal file se disponibile, altrimenti quello passato come parametro
      // const subject =
      //   subjectContent?.trim() || options.subject || `Email da ${templateName}`;

      // await this.sendEmail({
      //   to: options.to,
      //   subject,
      //   text: textContent,
      //   html: htmlContent,
      // });

      this.logger.log(
        `📧 Email inviata usando template '${templateName}' a ${options.to}`
      );
    } catch (error) {
      this.logger.error(
        `❌ Errore nell'invio email con template '${templateName}':`,
        error
      );
      throw error;
    }
  }

  // /**
  //  * Send email using file-based tenant template
  //  */
  // async sendEmailWithTenantTemplate(
  //   loggedUser: LoggedUser,
  //   templateName: string,
  //   options: {
  //     to: string;
  //     subject?: string;
  //     variables?: Record<string, any>;
  //   }
  // ): Promise<void> {
  //   try {
  //     // Carica il template da file
  //     const template = await this.templateLoader.loadTenantTemplate(
  //       loggedUser,
  //       {
  //         templateName,
  //         variables: options.variables,
  //       }
  //     );

  //     // Prova a ottenere i contenuti dai file
  //     const htmlContent =
  //       template.getByExtension("html") || template.getByExtension("htm");
  //     const textContent =
  //       template.getByFilename("txt") ||
  //       template.getByFilename("text") ||
  //       template.getByExtension("txt") ||
  //       template.getByExtension("text");
  //     const subjectContent = template.getByExtension("subject");

  //     // Usa il subject dal file se disponibile, altrimenti quello passato come parametro
  //     const subject =
  //       subjectContent?.trim() || options.subject || `Email da ${templateName}`;

  //     await this.sendEmail({
  //       to: options.to,
  //       subject,
  //       text: textContent,
  //       html: htmlContent,
  //     });

  //     this.logger.log(
  //       `📧 Email inviata usando template '${templateName}' a ${options.to}`
  //     );
  //   } catch (error) {
  //     this.logger.error(
  //       `❌ Errore nell'invio email con template '${templateName}':`,
  //       error
  //     );
  //     throw error;
  //   }
  // }

  // /**
  //  * Send email using file-based user template
  //  */
  // async sendEmailWithUserTemplate(
  //   userId: string,
  //   options: {
  //     to: string;
  //     subject?: string;
  //     variables?: Record<string, any>;
  //   }
  // ): Promise<void> {
  //   try {
  //     // Carica il template da file
  //     const template = await this.templateLoader.loadUserTemplate({
  //       userId,
  //       variables: options.variables
  //     });

  //     // Prova a ottenere i contenuti dai file
  //     const htmlContent = template.getByExtension('html') || template.getByExtension('htm');
  //     const textContent = template.getByFilename('txt') || template.getByFilename('text') || template.getByExtension('txt') || template.getByExtension('text');
  //     const subjectContent = template.getByExtension('subject');

  //     // Usa il subject dal file se disponibile, altrimenti quello passato come parametro
  //     const subject = subjectContent?.trim() || options.subject || `Email da ${userId}`;

  //     await this.sendEmail({
  //       to: options.to,
  //       subject,
  //       text: textContent,
  //       html: htmlContent
  //     });

  //     this.logger.log(`📧 Email inviata usando template '${userId}' a ${options.to}`);
  //   } catch (error) {
  //     this.logger.error(`❌ Errore nell'invio email con template '${userId}':`, error);
  //     throw error;
  //   }
  // }

  // /**
  //  * Send verification email using file template if available, fallback to hardcoded
  //  */
  // async sendVerificationEmailFromTemplate(
  //   loggedUser: LoggedUser,
  //   options: VerificationEmailOptions
  // ): Promise<void> {
  //   try {
  //     await this.sendEmailWithTenantTemplate(loggedUser, "verification", {
  //       to: options.to,
  //       subject: "🔐 Verifica il tuo account Dike",
  //       variables: {
  //         username: options.username || "Utente",
  //         verificationLink:
  //           options.link || `${this.frontendBaseUrl}/verify-email`,
  //       },
  //     });
  //   } catch (error) {
  //     // Fallback al template hardcoded
  //     this.logger.warn(
  //       `⚠️ Template file non disponibile, uso template hardcoded per verification`
  //     );
  //     await this.sendVerificationEmail(loggedUser, options);
  //   }
  // }

  // /**
  //  * Send welcome email using file template if available, fallback to hardcoded
  //  */
  // async sendWelcomeEmailFromTemplate(
  //   loggedUser: LoggedUser,
  //   options: WelcomeEmailOptions
  // ): Promise<void> {
  //   try {
  //     await this.sendEmailWithTenantTemplate(loggedUser, "welcome", {
  //       to: options.email,
  //       subject: "🎉 Benvenuto su Dike!",
  //       variables: {
  //         username: options.username,
  //         loginLink: options.loginLink || `${this.frontendBaseUrl}/login`,
  //       },
  //     });
  //   } catch (error) {
  //     // Fallback al template hardcoded
  //     this.logger.warn(
  //       `⚠️ Template file non disponibile, uso template hardcoded per welcome`
  //     );
  //     await this.sendWelcomeEmail(loggedUser, options);
  //   }
  // }

  // /**
  //  * Send password reset email using file template if available, fallback to hardcoded
  //  */
  // async sendPasswordResetEmailFromTemplate(
  //   loggedUser: LoggedUser,
  //   options: PasswordResetEmailOptions
  // ): Promise<void> {
  //   try {
  //     await this.sendEmailWithTenantTemplate(loggedUser, "password-reset", {
  //       to: options.email,
  //       subject: "🔑 Reset Password Dike",
  //       variables: {
  //         username: options.username || "Utente",
  //         resetLink:
  //           options.resetLink || `${this.frontendBaseUrl}/reset-password`,
  //       },
  //     });
  //   } catch (error) {
  //     // Fallback al template hardcoded
  //     this.logger.warn(
  //       `⚠️ Template file non disponibile, uso template hardcoded per password-reset`
  //     );
  //     await this.sendPasswordResetEmail(loggedUser, options);
  //   }
  // }

  // /**
  //  * Lista tutti i template disponibili
  //  */
  // async getAvailableTemplates(
  //   loggedUser: LoggedUser,
  // ): Promise<string[]> {
  //   return this.templateLoader.listAvailableTemplates();
  // }

  // /**
  //  * Lista i file di un template specifico
  //  */
  // async getTemplateFiles(
  //   loggedUser: LoggedUser,
  //   templateName: string
  // ): Promise<string[]> {
  //   return this.templateLoader.listTemplateFiles(templateName);
  // }

  // /**
  //  * Pulisce la cache dei template
  //  */
  // clearTemplateCache(): void {
  //   this.templateLoader.clearCache();
  // }

  // /**
  //  * Metodo di test per verificare il caricamento dei template
  //  */
  // async testTemplateLoader(
  //   loggedUser: LoggedUser
  // ): Promise<void> {
  //   this.logger.log("🧪 Test del TemplateLoaderService...");

  //   try {
  //     // Test caricamento template di verifica
  //     const verificationTemplate = await this.templateLoader.loadTenantTemplate(
  //       loggedUser,
  //       {
  //         templateName: "verification/email",
  //       }
  //     );

  //     this.logger.log("✅ Template verification/email caricato:");
  //     this.logger.log(
  //       `   - Files disponibili: ${verificationTemplate.getAllExtensions().join(", ")}`
  //     );

  //     if (verificationTemplate.hasExtension("subject")) {
  //       this.logger.log(
  //         `   - Subject: ${verificationTemplate.getByExtension("subject")}`
  //       );
  //     }

  //     // Test caricamento template di benvenuto
  //     const welcomeTemplate = await this.templateLoader.loadTenantTemplate(
  //       loggedUser,
  //       { templateName: "welcome/user" }
  //     );

  //     this.logger.log("✅ Template welcome/user caricato:");
  //     this.logger.log(
  //       `   - Files disponibili: ${welcomeTemplate.getAllExtensions().join(", ")}`
  //     );

  //     if (welcomeTemplate.hasExtension("subject")) {
  //       this.logger.log(
  //         `   - Subject: ${welcomeTemplate.getByExtension("subject")}`
  //       );
  //     }

  //     this.logger.log("🎉 Test del TemplateLoader completato con successo!");
  //   } catch (error) {
  //     this.logger.error(
  //       "❌ Errore nel test del TemplateLoader:",
  //       error.message
  //     );
  //     throw error;
  //   }
  // }

  // /**
  //  * Send already registered email
  //  */
  // async sendAlreadyRegisteredEmail(
  //   loggedUser: LoggedUser,
  //   options: AlreadyRegisteredEmailOptions
  // ): Promise<void> {
  //   try {
  //     await this.sendEmailWithTenantTemplate(loggedUser, "already-registered", {
  //       to: options.to,
  //       subject: "🔐 Account già registrato",
  //       variables: {
  //         originIp: options.originIp,
  //         originUserAgent: options.originUserAgent,
  //       },
  //     });
  //   } catch (error) {
  //     // Fallback al template hardcoded
  //     this.logger.warn(
  //       `⚠️ Template file non disponibile, uso template hardcoded per already-registered`
  //     );
  //     await this.sendAlreadyRegisteredEmail(loggedUser, options);
  //   }
  // }
}
