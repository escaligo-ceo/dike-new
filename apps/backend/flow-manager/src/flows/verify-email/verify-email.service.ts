import { AccessAction, AccessResponse, AccessStatus, AccessStep, AccessStepStatus, AppLogger, DikeConfigService, Email, EmailVerificationToken, LoginDto, OriginDto } from "@dike/common";
import { IBaseStep, LoggedUser } from "@dike/communication";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAndSendEmailStep } from "./steps/create-and-send-email.step";
import { HttpNotificationService } from "../../communication/http.notification.service";
import { UpdateStep } from "./steps/update.step";
import { ValidateStep } from "./steps/validate.step";
import { randomBytes, createHash } from 'crypto';
import { raw } from "express";

export class VerifyEmailService {
  constructor(
    @InjectRepository(EmailVerificationToken)
    private readonly _tokenRepository: Repository<EmailVerificationToken>,
    private readonly logger: AppLogger,
    private readonly _httpNotificationService: HttpNotificationService,
    private readonly _configurationService: DikeConfigService,
  ) {
    this.logger = new AppLogger(VerifyEmailService.name);
  }

  async verifyEmailToken(loggedUser: LoggedUser, token: string): Promise<void> {
    // Implementation for verifying the email token
  }

  /**
   * Genera un token univoco e sicuro per la verifica email.
   * @returns {{ rawToken: string; hashedToken: string; expiresAt: Date }} - Un oggetto contenente il token in chiaro (da inviare via mail) 
   * e la versione hashata (da salvare nel DB per sicurezza).
   */
  generateEmailVerificationToken(): { rawToken: string; hashedToken: string; expiresAt: Date } {
    // Generiamo una stringa randomica ad alta entropia
    const rawToken = randomBytes(32).toString('hex');

    // Hashiamo il token prima di salvarlo (opzionale, ma consigliato per la security)
    // Se qualcuno buca il DB, non può usare i token attivi.
    const hashedToken = createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const expirationHours = parseInt(this._configurationService.env('FLOW_MANAGER_VERIFY_EMAIL_EXPIRATION_HOURS', '24'));

    // Impostiamo una scadenza (es. 24 ore)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    return {
      rawToken,      // Da passare al servizio di notifica per il link nella mail
      hashedToken,   // Da salvare sul DB nella tabella/colonna dedicata
      expiresAt,
    };
  }

  async createEmailVerificationToken(originDto: OriginDto, loginDto: LoginDto): Promise<EmailVerificationToken> {
    const { rawToken, hashedToken, expiresAt } = this.generateEmailVerificationToken();
    const instance = this._tokenRepository.create({
      userId: loginDto.userId,
      email: loginDto.email,
      token: rawToken,
      used: false,
      ip: originDto.originIp,
      userAgent: originDto.originUserAgent,
      hashedToken,
      expiresAt,
    });
    return this._tokenRepository.save(instance);
  }

  async start(loginDto: LoginDto): Promise<AccessResponse> {
    const steps: IBaseStep[] = [
      new CreateAndSendEmailStep(
        this._httpNotificationService,
        this,
      ),
      new ValidateStep(
        this._tokenRepository,
      ),
      new UpdateStep(
        this._tokenRepository,
      ),
    ];

    for (const step of steps) {
      const result = await step.execute(loginDto, {});
    }

    return {
      status: AccessStatus.SUCCESS,
      step: AccessStep.READY,
      stepStatus: AccessStepStatus.COMPLETED,
      nextAction: AccessAction.ACCESS_APP,
    };
  }}