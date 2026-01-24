import { AppLogger, inspect, Token } from "@dike/common";
import { Injectable, Scope } from "@nestjs/common";
import { ApiGatewayService } from "../api-gateway.service";
import { DecodedKeycloakToken } from "../keycloak/keycloak.interface";
import { LoggedUser } from "./logged-user";

@Injectable({ scope: Scope.REQUEST })
export class UserFactory {
  constructor(
    private readonly logger: AppLogger,
    private readonly apiGatewayService: ApiGatewayService
  ) {
    this.logger = new AppLogger(UserFactory.name);
  }

  /**
   * Instance of LoggedUser created from decoded JWT token payload
   * @param {DecodedKeycloakToken | undefined} decodedKeycloakToken Decoded JWT token payload (from req.user or req.decodedKeycloakToken)
   * @param {string} originIp Origin IP address of the request
   * @param {string} originUserAgent Origin User-Agent of the request
   * @param {string} authorization Authorization bearer token
   * @returns {LoggedUser} LoggedUser instance
   */
  fromToken(
    decodedKeycloakToken:
      | DecodedKeycloakToken
      | { header?: any; payload?: DecodedKeycloakToken; signature?: string }
      | undefined,
    originIp: string,
    originUserAgent: string,
    authorization: string,
    refresh?: string
  ): LoggedUser {
    if (!decodedKeycloakToken) {
      console.trace();
      this.logger.error(
        `Decoded token payload is missing`
      );
      // throw new Error("Decoded token payload is missing (req.user undefined)");
    }
    let payload: DecodedKeycloakToken;
    if (
      typeof decodedKeycloakToken === "object" &&
      "payload" in decodedKeycloakToken &&
      (decodedKeycloakToken as any).payload
    ) {
      payload = (decodedKeycloakToken as any).payload;
    } else {
      payload = decodedKeycloakToken as DecodedKeycloakToken;
    }
    if (!payload) {
      console.trace();
      this.logger.error(
        `Decoded token payload is missing after extraction: ${inspect(decodedKeycloakToken)}`
      );
      // throw new Error(
      //   "Decoded token payload is missing after extraction (req.user undefined)"
      // );
    }
    const tokenDto: Token = new Token(
      originIp,
      originUserAgent,
      authorization,
      refresh ?? payload.refresh_token
    );

    // Normalize payload across RS256 (Keycloak) and HS256 (extended) tokens
    const userId = payload.sub || payload.userId || payload.id;
    if (!userId) {
      throw new Error(
        `Decoded token missing user identifier (sub/userId/id): ${inspect(payload)}`
      );
    }

    const username =
      (payload as any).username ||
      (payload as any).preferred_username ||
      (payload as any).name ||
      undefined;
    const email =
      (payload as any).email ||
      (payload as any).mail ||
      undefined;
    const emailVerified = payload.email_verified || false;

    // const tenantId = this.apiGatewayService.getTenantIdFromToken(decodedKeycloakToken); // FIXME: occhio ai riferimenti circolari

    return new LoggedUser(
      userId,
      username,
      email,
      emailVerified,
      tokenDto,
      this.apiGatewayService
    );
  }
}
