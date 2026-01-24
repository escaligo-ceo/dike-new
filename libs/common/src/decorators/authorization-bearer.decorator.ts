import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const AuthorizationBearer = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const req = ctx.switchToHttp().getRequest();
    const authHeader =
      req.headers["authorization"] ||
      req.cookies?.access_token ||
      req.cookies?.["keycloak-token"] ||
      null;
    return authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  }
);
