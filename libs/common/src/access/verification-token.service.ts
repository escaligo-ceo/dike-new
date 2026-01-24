import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as crypto from "crypto";
import { DikeConfigService } from "../app/load-env-value.js";
import { AppLogger } from "../app/logger.js";
import { inspect } from "../app/utils.js";
import {
  IExchangeTokenOptions,
  IVerificationLinkOptions,
  IVerificationResult,
  IVerificationToken,
  VerificationResult,
} from "./verification-token.interface.js";
import { DikeJwtService } from "../jwt/jwt.service.js";
import { TokenType, VerificationError } from "./access.enum.js";

@Injectable()
export class VerificationTokenService {
  public readonly defaultExpirationMinutes = [
    24 * 60, // email_verification: 24 ore
    60, // password_reset: 1 ora
    7 * 24 * 60, // account_activation: 7 giorni
    60, // access: 1 ora
  ];

  constructor(
    private readonly jwtService: DikeJwtService,
    private readonly configService: DikeConfigService,
    private readonly logger: AppLogger
  ) {
    this.logger = new AppLogger(VerificationTokenService.name);
  }

  get frontendBaseUrl(): string {
    return this.configService.env("FRONTEND_URL", "http://localhost:5172");
  }

  /**
   * Genera un link di verifica sicuro
   * @param {IVerificationLinkOptions} options - Opzioni per la generazione del link
   * @param {string} options.userId - ID dell'utente
   * @param {string} options.email - Email dell'utente
   * @param {TokenType} options.tokenType - Tipo di token (es. EMAIL_VERIFICATION)
   * @param {number} [options.expirationMinutes] - Minuti di validità del token
   * @param {string} [options.baseUrl] - URL base del frontend
   * @returns {IVerificationResult} Link di verifica, token e data di scadenza
   */
  generateEmailVerificationToken(options: IVerificationLinkOptions): IVerificationResult {
    options.tokenType = options.tokenType || TokenType.EMAIL_VERIFICATION;
    options.expirationMinutes =
      options.expirationMinutes ||
      this.defaultExpirationMinutes[options.tokenType];

    const { verificationToken: token, expiresAt } =
      this.createVerificationToken(options);

    const baseUrl = options.baseUrl || this.frontendBaseUrl;

    const endpoint = this.getEndpointForTokenType(options.tokenType);

    // Struttura del link: https://dike.cloud/auth/verify-email?token=abc123&email=user@example.com
    const verificationUrl = new URL(`${baseUrl}${endpoint}`);
    verificationUrl.searchParams.set("token", token);
    verificationUrl.searchParams.set("email", options.email);

    this.logger.log(
      `🔗 Link di verifica generato per ${options.email} (${options.tokenType})`
    );

    return {
      verificationUrl: verificationUrl.toString(),
      token,
      expiresAt,
    };
  }

  /**
   * Crea un token JWT sicuro per la verifica
   */
  public createVerificationToken(options: IVerificationLinkOptions): {
    verificationToken: string;
    expiresAt: Date;
  } {
    const expirationMinutes =
      options.expirationMinutes ||
      this.defaultExpirationMinutes[options.tokenType];

    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    const payload: IVerificationToken = {
      userId: options.userId,
      email: options.email,
      tokenType: options.tokenType,
      expiresAt,
      createdAt: new Date(),
      isUsed: false,
    };

    return {
      verificationToken: this.jwtService.sign(payload, {
        expiresIn: `${expirationMinutes}m`,
        issuer: "dike-auth-service",
        audience: "dike-frontend",
      }),
      expiresAt,
    };
  }

  /**
   * Verifica e decodifica un token di verifica
   *
   * @param {string} token - Il token da verificare
   * @param {TokenType} expectedType - Tipo di token atteso (opzionale)
   * @returns {Promise<VerificationResult>} Risultato della verifica
   */
  async verifyToken(
    token: string,
    expectedType?: TokenType
  ): Promise<VerificationResult> {
    try {
      const decoded = this.jwtService.verify(token, {
        issuer: "dike-auth-service",
        audience: "dike-frontend",
      });

      // Verifica il tipo di token se specificato
      if (expectedType && decoded.tokenType !== expectedType) {
        return {
          success: false,
          error: "Tipo di token non valido",
          errorCode: VerificationError.TOKEN_INVALID,
        };
      }

      // Verifica se il token è già stato usato (questa logica andrà implementata con un database)
      // TODO: Implementare controllo in database per token già usati

      return {
        success: true,
        userId: decoded.userId,
        email: decoded.email,
      };
    } catch (error) {
      this.logger.error(
        `❌ Errore nella verifica del token: ${inspect(error)}`
      );

      if (error.name === "TokenExpiredError") {
        return {
          success: false,
          error: "Token scaduto",
          errorCode: VerificationError.TOKEN_EXPIRED,
        };
      }

      if (error.name === "JsonWebTokenError") {
        return {
          success: false,
          error: "Token non valido",
          errorCode: VerificationError.TOKEN_INVALID,
        };
      }

      return {
        success: false,
        error: "Errore nella verifica del token",
        errorCode: VerificationError.TOKEN_INVALID,
      };
    }
  }

  async verifyAdminToken(token: string): Promise<IVerificationToken | false> {
    try {
      const decoded = await this.jwtService.decode(token);
      if (!decoded || typeof decoded === "string") {
        this.logger.error("Token decodificato non valido");
        return false;
      }

      // const verified = this.jwtService.verify<IVerificationToken>(token, {
      //   secret: this.secret,
      //   issuer: "dike-auth-service",
      //   audience: "dike-frontend",
      // });

      // return verified;

      return decoded;
    } catch (error) {
      this.logger.error(
        `❌ Errore nella verifica del token admin: ${inspect(error)}`
      );
      return false;
    }
  }

  /**
   * Genera un token sicuro alternativo (non JWT) per maggiore sicurezza
   */
  generateSecureToken(): string {
    // Genera un token random di 32 byte (256 bit) in formato hex
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Genera un token corto per SMS o altri usi
   */
  generateShortToken(length: number = 6): string {
    const chars = "0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Ottiene l'endpoint corretto in base al tipo di token
   */
  private getEndpointForTokenType(tokenType: TokenType): string {
    switch (tokenType) {
      case TokenType.EMAIL_VERIFICATION:
        return "/auth/verify-email";
      case TokenType.PASSWORD_RESET:
        return "/auth/reset-password";
      case TokenType.ACCOUNT_ACTIVATION:
        return "/auth/activate-account";
      default:
        return "/auth/verify";
    }
  }

  /**
   * Estrae informazioni dal token senza verificarlo (per debugging)
   */
  decodeTokenInfo(token: string): any {
    try {
      return this.jwtService.decode(token);
    } catch (error) {
      return null;
    }
  }

  private verifyKeycloakToken(token: string) {
    // puoi fare introspection o usare jwks-rsa per la verifica
    return this.jwtService.decode(token); // esempio semplificato
  }

  /**
   * Scambia un token Keycloak con un token interno firmato dal servizio e arricchito con tenantId
   *
   * @param {string} keycloakToken - token da Keycloak
   * @param {string} tenantId - ID del tenant
   * @param {IExchangeTokenOptions} options - Opzioni per lo scambio del token
   * @returns {Promise<{ token: string }>} Token scambiato
   */
  async exchangeToken(
    keycloakToken: string,
    tenantId: string,
    options: IExchangeTokenOptions = {
      tokenType: TokenType.ACCESS,
      expirationMinutes: 60,
    }
  ): Promise<{ token: string }> {
    // ✅ 1. Verifica il token Keycloak (puoi usare JWKS o introspection)
    const decoded: any = this.verifyKeycloakToken(keycloakToken);
    if (!decoded?.sub)
      throw new UnauthorizedException("Invalid Keycloak token");

    const keycloakUserId = decoded.sub;

    // ✅ 2. Recupera profilo e tenant dal profile-service
    // const profileResp = await axios.get(
    //   `${process.env.PROFILE_SERVICE_URL}/profiles/by-keycloak-id/${keycloakUserId}`,
    // );

    // ✅ 3. Crea un JWT “interno” firmato dal tuo servizio
    const expirationMinutes =
      options.expirationMinutes ||
      this.defaultExpirationMinutes[options.tokenType];
    const payload = {
      sub: keycloakUserId,
      // userId: profile.id,
      tenantId,
      // email: profile.email,
      // roles: profile.roles || [],
      roles: [], // TODO: recuperare i ruoli reali
    };
    const appToken = this.jwtService.sign(payload, {
      // algorithm: "HS256",
      expiresIn: `${expirationMinutes}m`,
      issuer: "dike-auth-service",
      audience: "dike-frontend",
    });

    // ✅ 4. Restituisci il token al frontend
    return { token: appToken };
  }
}
