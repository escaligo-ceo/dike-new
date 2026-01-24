import { AppLogger, Token, TokenType, VerificationTokenService } from "@dike/common";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HttpNotificationService } from "../communication/http.notification.service";
import { EmailVerificationToken } from "../entities/email-verification-token.entity";
import { WatchedPersonService } from "../watched-person/watched-person.service";
import { ApiGatewayService, BaseAdminService, IKeycloakUser, KeycloakService, LoggedUser } from "@dike/communication";
import { IVerificationResult } from "@dike/common/src/access/verification-token.interface";

@Injectable()
export class AdminService extends BaseAdminService {
  constructor(
    private readonly keycloakService: KeycloakService,
    protected readonly apiGatewayService: ApiGatewayService,
    private readonly verificationTokenService: VerificationTokenService,
    private readonly httpNotificationService: HttpNotificationService,
    @InjectRepository(EmailVerificationToken)
    private readonly tokenRepository: Repository<EmailVerificationToken>,
    private readonly watchedPersonService: WatchedPersonService,
  ) {
    super(
      new AppLogger(AdminService.name),
      apiGatewayService,
    );
  }

  /**
   * Genera un nuovo token di verifica email e invia la mail tramite il servizio notifiche
   */
  async generateEmailVerificationToken(
    loggedUser: LoggedUser,
  ): Promise<void> {
    this.logger.debug(`Recupera l'utente da keycloak with: ${loggedUser.id}`);
    const user: IKeycloakUser = await this.keycloakService.getUserById(loggedUser);
    if (!user || !user.email) {
      throw new HttpException(
        "Utente non trovato o senza email",
        HttpStatus.NOT_FOUND
      );
    }
    const email = user.email;
    const userId = loggedUser.id;
    this.logger.debug("Genera nuovo token");
    const emailVerificationTokenResponse: IVerificationResult =
      this.verificationTokenService.generateEmailVerificationToken({
        userId,
        email,
        tokenType: TokenType.EMAIL_VERIFICATION,
      });
    const { verificationUrl, token, expiresAt } =
      emailVerificationTokenResponse;
    this.logger.debug("Salva il nuovo token");
    const entity = this.tokenRepository.create({
      email,
      userId,
      token,
      expiresAt,
    });
    await this.tokenRepository.save(entity);
    this.logger.log(`Invia la mail tramite servizio notifiche`);
    await this.httpNotificationService.sendVerificationEmail(
      loggedUser,
      email,
      verificationUrl
    );
    this.logger.log(`Nuova mail di verifica inviata a ${email}`);
  }

  async getWatchedPersons(loggedUser: LoggedUser) {
    return this.watchedPersonService.findAll(loggedUser);
  }
}
