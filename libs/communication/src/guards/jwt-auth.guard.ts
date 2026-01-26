import {
  AppLogger,
  BaseUrl,
  DikeJwtService,
  extractTokenFromRequest,
  inspect,
} from "@dike/common";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ModuleRef, Reflector } from "@nestjs/core";
import { KeycloakService } from "../keycloak/keycloak.service";
import * as jwt from "jsonwebtoken";
import { DecodedKeycloakToken } from "../keycloak/keycloak.interface";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private keycloakParams: BaseUrl;
  private readonly keycloakBootstrapAdminUrl: string | undefined;
  private readonly keycloakRealm: string | undefined;

  constructor(
    private readonly logger: AppLogger,
    private readonly moduleRef: ModuleRef,
    private readonly keycloakService: KeycloakService,
    private readonly jwtService: DikeJwtService
  ) {
    this.logger = new AppLogger(JwtAuthGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get Reflector dynamically from module context
    const reflector = this.moduleRef.get(Reflector, { strict: false });
    
    // Check if route is marked as public
    const isPublic = reflector.get<boolean>(
      "isPublic",
      context.getHandler()
    );
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Unified token extraction relying on Authorization header or cookies only
    const token = extractTokenFromRequest(request);
    // Ensure downstream decorators (@AuthorizationBearer) can access it
    if (!request.headers.authorization) {
      request.headers.authorization = `Bearer ${token}`;
    }

    try {
      // Decodifica il token per ottenere il kid (key ID)
      const decodedKeycloakToken: DecodedKeycloakToken = jwt.decode(token, {
        complete: true,
      }) as any;
      if (!decodedKeycloakToken) {
        this.logger.error("❌ Failed to decode token");
        throw new UnauthorizedException("Invalid token format");
      }

      // Controlla se è un token extended (HS256) o Keycloak (RS256)
      const algorithm = decodedKeycloakToken?.header?.alg;
      this.logger.debug(`🔍 Token algorithm: ${algorithm}`);

      // if (algorithm === "HS256") {
      //   // Token extended dall'auth-service con tenantId
      //   this.logger.debug("✅ Detected HS256 token (extended token)");
      //   const payload = jwt.verify(
      //     token,
      //     this.secret,
      //     // {
      //     //   algorithms: ["HS256"],
      //     // }
      //   );

      //   request["user"] = payload;
      //   // Propagate extended token as Authorization header if not set
      //   if (!request.headers.authorization) {
      //     request.headers.authorization = `Bearer ${token}`;
      //   }
      //   return true;
      // } // Token Keycloak (RS256)
      // if (!decodedKeycloakToken?.header?.kid) {
      //   this.logger.error(
      //     `❌ Invalid token format - algorithm: ${algorithm}, no kid for RS256`
      //   );
      //   throw new UnauthorizedException("Invalid token format");
      // }

      // Ottieni la chiave pubblica da Keycloak
      const key = await this.keycloakService.getKeycloakPublicKey(
        decodedKeycloakToken.header.kid
      );
      this.logger.debug("✅ Public key retrieved");

      // Verifica il token
      const payload = jwt.verify(token, key, {
        algorithms: ["RS256"],
        issuer: this.keycloakService.issuer,
      });

      this.logger.debug(
        `✅ Token verified successfully\n- User payload: ${inspect(payload)}`
      );

      // Aggiungi il payload decodificato alla richiesta
      request["user"] = payload;

      // Setta l'utente nel request
      request.decodedKeycloakToken = {
        ...decodedKeycloakToken,
        role: "user",
      };
      return true;
    } catch (error) {
      // If expired, try refresh using HttpOnly cookie 'rt'
      if (error?.name === "TokenExpiredError") {
        const rt = request?.cookies?.["rt"];
        if (rt) {
          try {
            const refreshed = await this.keycloakService.refreshToken(rt);
            const newAccess = refreshed?.access_token;
            const newRefresh = refreshed?.refresh_token;
            if (newAccess) {
              // Update cookies and Authorization header
              response.cookie("access_token", newAccess, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
              });
              if (newRefresh) {
                response.cookie("rt", newRefresh, {
                  httpOnly: true,
                  secure: true,
                  sameSite: "lax",
                });
              }
              request.headers.authorization = `Bearer ${newAccess}`;

              // Retry verification once with new token
              const decodedTokenRetry: DecodedKeycloakToken = jwt.decode(
                newAccess,
                { complete: true }
              ) as any;
              const algRetry = decodedTokenRetry?.header?.alg;
              if (algRetry === "HS256") {
                this.logger.debug("✅ Detected HS256 token on refresh");
                const payload = jwt.verify(newAccess, this.jwtService.secret, {
                  algorithms: ["HS256"],
                });
                request["user"] = payload;
                return true;
              }
              if (!decodedTokenRetry?.header?.kid) {
                throw new UnauthorizedException("Invalid token format");
              }
              const keyRetry = await this.keycloakService.getKeycloakPublicKey(
                decodedTokenRetry.header.kid
              );
              const issuer = `${this.keycloakParams.baseUrl()}/realms/master`;
              const payload = jwt.verify(newAccess, keyRetry, {
                algorithms: ["RS256"],
                issuer,
              });
              request["user"] = payload;
              return true;
            }
          } catch (e) {
            this.logger.error(`Token refresh failed: ${e?.message}`);
          }
        }
      }
      this.logger.error(`Token validation error: ${error.message}`);
      console.trace();
      throw new UnauthorizedException(
        `Token validation error: ${error.message}`
      );
    }
  }
}
