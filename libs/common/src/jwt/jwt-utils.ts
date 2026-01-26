import { Request } from "express";

export function extractTokenFromRequest(request: Request): string {
  // Prova a prendere il token dall'header Authorization
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Prova a prendere il token dai cookie (keycloak-token ha priorità)
  const keycloakToken = request.cookies?.["keycloak-token"];
  if (keycloakToken) {
    return keycloakToken;
  }

  // Fallback su access_token
  const accessToken = request.cookies?.["access_token"];
  if (accessToken) {
    return accessToken;
  }

  // Nota: NON estraiamo più il token dai query params per sicurezza.
  // Le pagine SSR devono usare i cookie HttpOnly oppure l'header Authorization.

  throw new Error("token not found in request");
}
