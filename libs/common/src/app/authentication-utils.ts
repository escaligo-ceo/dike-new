import { IAuthenticatedRequest } from "./app.interface.js";

export function getAccessToken(req: IAuthenticatedRequest): string | undefined {
  return req.headers['authorization']?.split(' ')[1];
}
