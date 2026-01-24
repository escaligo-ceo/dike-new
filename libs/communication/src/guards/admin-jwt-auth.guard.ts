import { AppLogger, extractTokenFromRequest, VerificationTokenService } from "@dike/common";
import {
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { DecodedKeycloakToken } from "../keycloak/keycloak.interface";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AdminAuthGuard {
  constructor(
    private logger: AppLogger,
    @Inject(forwardRef(() => VerificationTokenService))
    private verificationTokenService: VerificationTokenService
  ) {
    this.logger = new AppLogger(AdminAuthGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Se la rotta è /admin/login, permetti l'accesso senza token
    if (request.path === "/admin/login") {
      return true;
    }

    // Unified token extraction relying on Authorization header or cookies only
    const token = extractTokenFromRequest(request);
    // Ensure downstream decorators (@AuthorizationBearer) can access it
    if (!request.headers.authorization) {
      request.headers.authorization = `Bearer ${token}`;
    }

    if (!token) {
      this.logger.error("No access_token provided");
      response.redirect(302, "/admin/login");
      return false;
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

      // Setta l'utente nel request
      request.decodedKeycloakToken = {
        ...decodedKeycloakToken,
        role: "admin",
      };
      return true;
    } catch (error) {
      this.logger.error(`Admin token validation failed: ${error.message}`);
      response.redirect(302, "/admin/login");
      return false;
    }
  }

  /**
   * Decodifica il token JWT (senza verifica firma) da cookie o header
   */
  decodeTokenFromRequest(request: {
    cookies?: any;
    headers?: any;
  }): Record<string, any> | null {
    let token: string | undefined = request.cookies?.access_token;
    if (!token && request.headers?.authorization) {
      const authHeader = request.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }
    if (!token) return null;
    // Decodifica senza verifica firma usando VerificationTokenService
    const decoded = this.verificationTokenService["jwtService"].decode(token);
    return typeof decoded === "object" && decoded !== null
      ? (decoded as Record<string, any>)
      : null;
  }
}
