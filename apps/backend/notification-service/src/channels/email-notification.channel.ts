import { AppLogger, BaseUrl, DikeConfigService } from "@dike/common";
import * as nodemailer from "nodemailer";
import { Notification } from "../entities/notification.entity";
import { ResourceType } from "../entities/resource.entity";
import { BaseNotificationChannel, DeliveryResult } from "../notification/base-notification-channel.type";

export class EmailNotificationChannel extends BaseNotificationChannel {
  private transporter: nodemailer.Transporter;
  // private smtpConfigParams: BaseUrl = {
  //   host: process.env.SMTP_HOST || 'smtps.aruba.it',
  //   port: parseInt(process.env.SMTP_PORT || '465'),
  //   secure: process.env.SMTP_SECURE === 'true',
  //   auth: {
  //     user: process.env.SMTP_USER || 'noreply@escaligo.it',
  //     pass: process.env.SMTP_PASSWORD || 'F&lWZ8FwU4CnM6'
  //   }
  // };
  private smtpConfigParams: BaseUrl;
  private readonly frontendServiceParams: BaseUrl;
  private smtpConfig: any; // FIXME: replace any with proper type

  constructor(
    private readonly config: {
      host: string;
      port: number;
      user: string;
      pass: string;
    },
    private readonly logger: AppLogger,
    private readonly configService: DikeConfigService,
  ) {
    super();
    this.logger = new AppLogger(EmailNotificationChannel.name);
    // this.transporter = nodemailer.createTransport({
    //   host: config.host,
    //   port: config.port,
    //   secure: false,
    //   auth: {
    //     user: config.user,
    //     pass: config.pass,
    //   },
    // });
    const smtpServiceUrl = this.configService.env("SMTP_CONNECTION_STR", "smtps://noreply@escaligo.it:F&lWZ8FwU4CnM6@smtps.aruba.it:465");
    this.smtpConfigParams = new BaseUrl(smtpServiceUrl);
    this.smtpConfig = {
      ...this.smtpConfigParams,
      secure: this.smtpConfigParams.protocol === "smtps",
    };
    const frontendServiceUrl = this.configService.env(
      "FRONTEND_URL",
      "http://localhost:5172"
    );
    this.frontendServiceParams = new BaseUrl(frontendServiceUrl);
  }

  public get frontendBaseUrl(): string {
    return this.frontendServiceParams.baseUrl();
  }

  async send(
    notification: Notification,
    options?: { to: string }
  ): Promise<DeliveryResult> {
    try {
      if (!this.transporter) {
        this.logger.log("Creating SMTP transporter...");
        this.transporter = nodemailer.createTransport(this.smtpConfig);
        this.logger.log("SMTP transporter created successfully.");
      }

      const { template } = notification;
      if (!template) {
        this.logger.warn(
          `No template found for notification: ${JSON.stringify(notification)}`
        );
        return { success: false, error: "No template found" };
      }
      const info = await this.transporter.sendMail({
        from: this.config.user,
        to: options?.to,
        subject:
          template.getResourcesByType(ResourceType.SUBJECT)[0]?.name ||
          undefined,
        text:
          template.getResourcesByType(ResourceType.TEXT)[0]?.name || undefined,
        html:
          template.getResourcesByType(ResourceType.HTML)[0]?.name || undefined,
      });

      return {
        success: true,
        sentAt: new Date(),
      };
    } catch (err) {
      return {
        success: false,
        error: err.message,
      };
    }

    // try {
    //   const mailOptions: EmailOptions = {
    //     from: options.from || process.env.SMTP_FROM || this.smtpConfig.auth.user,
    //     to: options.to,
    //     subject: options.subject,
    //     text: options.text,
    //     html: options.html
    //   };

    //   const result = await this.transporter.sendMail(mailOptions);
    //   this.logger.log(`📧 Email sent successfully to ${options.to}: ${result.messageId}`);
    // } catch (error) {
    //   this.logger.error(`📧 Failed to send email to ${options.to}:`, error);
    //   throw error;
    // }
  }
}
