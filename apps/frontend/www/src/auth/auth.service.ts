import {
  AccessAction,
  AccessResponse,
  AccessStep,
  AppLogger,
  DikeConfigService,
  ILoginResult,
  inspect,
  IRegisterResult,
  KeycloakUserDto,
  LoginStatus,
  LoginUserDto,
  OriginDto,
  Token,
} from "@dike/common";
import { ApiGatewayService, LoggedUser } from "@dike/communication";
import { BadRequestException, HttpStatus, Injectable } from "@nestjs/common";
import { sign } from "jsonwebtoken";

export interface EmailVerificationContext {
  isAuthenticated: boolean
  emailVerified?: boolean | null
  email?: string | null
  token?: string | null
}

@Injectable()
export class AuthService {
  constructor(
    private readonly apiGatewayService: ApiGatewayService,
    private readonly logger: AppLogger,
    private readonly configService: DikeConfigService
  ) {}

  async registerUser(
    originDto: OriginDto,
    keycloakUserDto: KeycloakUserDto
  ): Promise<IRegisterResult> {
    try {
      const result = await this.apiGatewayService.registerUser(
        originDto,
        keycloakUserDto
      );
      if (!result || typeof result !== "object" || !("email" in result)) {
        return {
          success: false,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          registrationStatus: "pending",
          message: "Risposta non valida dal backend",
          id: "",
          email: keycloakUserDto.email,
        };
      }
      return result;
    } catch (error) {
      return {
        success: false,
        status: error?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        registrationStatus: "failed",
        message: error?.message || "Errore durante la registrazione",
        id: "",
        email: keycloakUserDto.email,
      };
    }
  }

  async loginUser(
    originDto: OriginDto,
    { email, password, username }: LoginUserDto
  ): Promise<ILoginResult> {
    const accessResponse: AccessResponse = await this.apiGatewayService.loginUser(originDto, {
      email,
      password,
      username,
    });
    this.logger.debug(`loginUser: ${inspect(accessResponse)}`);

    this.handleAccessResponse(accessResponse);

    const { loginStatus, success, ...restRes } = accessResponse.context || {};
    return {
      loginStatus: LoginStatus.SUCCESS,
      success: true,
      ...restRes,
    };
  }

  async logoutUser(loggedUser: LoggedUser): Promise<any> {
    return this.apiGatewayService.logoutUser(loggedUser);
  }

  async refreshToken(tokenDto: Token): Promise<any> {
    return this.apiGatewayService.get(
      "/v1/auth/refresh-token",
      tokenDto.toOriginDto()
    );
  }

  async isEmailVerified(tokenDto: Token): Promise<boolean> {
    const res = await this.apiGatewayService.get(
      `/v1/auth/verify-email`,
      tokenDto
    );
    return res.data?.verified ?? false;
  }

  async verificationToken(originDto: OriginDto, email: string): Promise<void> {
    // 1. Trova utente
    const user = await this.apiGatewayService.findUserByEmailForVerification(originDto, email);
    if (!user) throw new Error("Utente non trovato");

    // 2. Controlla se già verificato
    if (user.isEmailVerified) {
      throw new BadRequestException("Email già verificata");
    }

    // 3. Genera token di verifica (JWT con scadenza breve, es. 1h)
    const token = sign(
      {
        sub: user.id,
        email: user.email,
      },
      this.configService.env("EMAIL_VERIFICATION_SECRET") || "segreto-email-verifica",
      { expiresIn: 60 * 60 * 1000 } // 1 ora in millisecondi
    );

    // 4. Salva il token nel database (opzionale, per invalidazione futura)
    await this.apiGatewayService.saveEmailVerificationToken(originDto, {
      userId: user.id,
      verificationToken: token,
    });

    // 5. Invia email con link
    
    const verificationUrl = `${this.configService.env("FRONTEND_URL")}/verify-email?token=${token}`;
    await this.apiGatewayService.sendEmail(originDto, {
      to: user.email,
      subject: "Conferma la tua email",
      body: `Clicca qui per verificare la tua email: ${verificationUrl}`,
    });
  }

  async verifyEmailToken(
    tokenDto: Token,
    email: string,
    verificationLink: string
  ): Promise<{ message: string }> {
    const verifyEmailTokenResponse =
      await this.apiGatewayService.verifyEmailToken(tokenDto, {
        to: email,
        verificationLink,
      });
    // const isVerified = false;
    this.logger.debug(
      `Email verification link validation for ${email}: ${inspect(verifyEmailTokenResponse)}`
    );

    return verifyEmailTokenResponse;
  }

  handleAccessResponse(response: AccessResponse) {
    switch (response.step) {
      case AccessStep.AUTHENTICATION:
        if (response.nextAction === AccessAction.VERIFY_2FA)
          this.show2FAForm();
        break;
      case AccessStep.F2A_VERIFICATION:
        this.show2FAForm();
        break;
      case AccessStep.EMAIL_VERIFICATION:
        this.showEmailVerificationForm(response.context);
        break;
      case AccessStep.SELECT_TENANT:
        this.showTenantSelection(response.context.tenants);
        break;
      case AccessStep.COMPLETED:
        const token = response.token?.value;
        if (!token) throw new Error('Token mancante!');
        sessionStorage.setItem('fullAccessToken', token);
        sessionStorage.setItem('refreshToken', response.refreshToken || '');
        sessionStorage.setItem('subscriptionPlan', response.context?.subscriptionPlan);
        this.showDashboard();
        break;
    }

    if (response.message) this.showNotification(response.message);
  }

  showEmailVerificationForm(
    ctx: EmailVerificationContext
  ): void {
    if (!ctx.isAuthenticated) return
    if (!ctx.email) return
    if (!ctx.token) return
    if (ctx.emailVerified === true) return

    // Redirigi a una pagina FE dedicata
    const emailParam = encodeURIComponent(ctx.email);
    window.location.href = `/email-verification?email=${emailParam}&token=${ctx.token}`;
  }

  async show2FAForm() {

  }

  async showTenantSelection(tenants: any[]) {

  }

  async showDashboard() {

  }

  async showNotification(message: string) {

  }
}
