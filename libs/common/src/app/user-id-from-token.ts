import { JwtService } from "@nestjs/jwt";

export function userIdFromToken(token: string): string {
  const jwtService = new JwtService();
  const payload = jwtService.decode(token) as { sub?: string; userId?: string };
  const userId = payload?.sub || payload?.userId;
  if (!userId) {
    console.trace();
    throw new Error("userId not found!");
  }
  return userId;
}

// export function tenantIdFromToken(token: string): string {
//   const jwtService = new JwtService();
//   const payload = jwtService.decode(token) as { sub?: string; userId?: string };
//   const tenantId = payload?.tenantId;
//   if (!tenantId) {
//     console.trace();
//     throw new Error("tenantId not found!");
//   }
//   return tenantId;
// }