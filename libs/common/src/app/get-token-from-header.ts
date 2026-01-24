export function getTokenFromHeader(req: Request): string | undefined {
  const authHeader = req.headers['authorization'];
  return authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
}