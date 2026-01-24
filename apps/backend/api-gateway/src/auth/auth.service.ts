import {
  AppLogger,
  IRegisterUserResult,
  KeycloakUserDto,
  OriginDto,
  Token,
} from "@dike/common";
import { Injectable } from "@nestjs/common";
import { HttpAuthService } from "../communication/http.auth.service";
import { LoggedUser, KeycloakService, IKeycloakUser } from "@dike/communication";

@Injectable()
export class AuthService {
  constructor(
    private readonly httpAuthService: HttpAuthService,
    private readonly logger: AppLogger
  ) {
    this.logger = new AppLogger(AuthService.name);
  }

  async logout(loggedUser: LoggedUser): Promise<any> {
    return this.httpAuthService.logout(loggedUser);
  }

  async register(
    originDto: OriginDto,
    keycloakUserDto: KeycloakUserDto
  ): Promise<IRegisterUserResult> {
    const registerResult: IRegisterUserResult =
      await this.httpAuthService.register(originDto, keycloakUserDto);

    const { userId, email, link, expiresAt } = registerResult;
    if (!link) {
      throw new Error("Verification link is not defined");
    }

    return registerResult;
  }

  async findUserByEmail(
    loggedUser: LoggedUser,
    email: string
  ): Promise<IKeycloakUser> {
    return this.httpAuthService.findUserByEmail(loggedUser, email);
  }

  async saveEmailVerificationToken(
    loggedUser: LoggedUser,
    userId: string,
    verificationToken: string
  ): Promise<void> {
    await this.httpAuthService.saveEmailVerificationToken(
      loggedUser,
      userId,
      verificationToken
    );
  }

  async verificationLink(originDto: OriginDto): Promise<string> {
    const res = await this.httpAuthService.get(
      `/v1/auth/verification-link`,
      originDto
    );
    return res.data;
  }

  async verifyEmail(
    originDto: OriginDto,
    verificationLink: string,
    to: string
  ): Promise<boolean> {
    return this.httpAuthService.verifyEmail(originDto, to, verificationLink);
  }

  async internalExchangeToken(
    originDto: OriginDto,
    token: string
  ): Promise<{ token: string }> {
    return this.httpAuthService.internalExchangeToken(originDto, token);
  }
}
