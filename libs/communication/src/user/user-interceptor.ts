import { AppLogger } from "@dike/common";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { UserFactory } from "./user-factory";

@Injectable()
export class LoggedUserInterceptor implements NestInterceptor {
  private readonly logger = new AppLogger(LoggedUserInterceptor.name);

  constructor(private readonly factory: UserFactory) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();

    this.logger.debug(`Interceptor called for ${request.url}`);
    this.logger.debug(`request.user exists: ${!!request.user}`);
    this.logger.debug(`factory exists: ${!!this.factory}`);

    // Skip if user is not authenticated (public routes)
    if (!request.user) {
      this.logger.debug("Skipping - no user in request");
      return next.handle();
    }

    // Extract origin IP
    const originIp = request.headers["x-forwarded-for"] || request.ip || null;

    // Extract origin user agent
    const originUserAgent =
      request.headers["x-forwarded-user-agent"] ||
      request.headers["user-agent"] ||
      null;

    // Extract authorization - try header first, then cookies
    let authorization = request.headers["authorization"] || null;
    if (!authorization && request.cookies) {
      authorization =
        request.cookies.access_token ||
        request.cookies["keycloak-token"] ||
        null;
    }

    let refreshToken = request.headers["refresh_token"] || null;
    if (!refreshToken && request.cookies) {
      refreshToken =
        request.cookies.refresh_token ||
        request.cookies["keycloak-refresh-token"] ||
        null;
    }

    this.logger.debug(
      `Authorization token: ${authorization ? "present" : "missing"}`
    );

    // Create user with origin data
    try {
      request.loggedUser = this.factory.fromToken(
        request.user,
        originIp,
        originUserAgent,
        authorization,
        refreshToken
      );
      this.logger.debug(`loggedUser created: ${!!request.loggedUser}`);
    } catch (error) {
      this.logger.error(`Error creating loggedUser: ${error.message}`);
      throw error;
    }

    // // Also store these on request for decorator access
    // request.originIp = originIp;
    // request.originUserAgent = originUserAgent;

    return next.handle();
  }
}
