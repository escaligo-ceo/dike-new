import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const OriginIp = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return (
      request.headers['x-forwarded-for'] ||
      request.ip ||
      null
    );
  },
);
