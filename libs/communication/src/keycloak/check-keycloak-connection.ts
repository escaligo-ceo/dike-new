import { AppLogger, BaseUrl, DikeConfigService } from "@dike/common";

export async function checkKeycloakConnection(
  configService: DikeConfigService,
  logger: AppLogger
) {
  const keycloakBootstrapAdminUrl = configService.env("KC_BOOTSTRAP_ADMIN_URL", "http://keycloak:8080");
  const keycloakRealm = configService.env("KEYCLOAK_REALM", "master");
  const keycloakParams = new BaseUrl(keycloakBootstrapAdminUrl);
  const jwksUri = `${keycloakParams.baseUrl()}/realms/${keycloakRealm}/protocol/openid-connect/certs`;
  logger.log(`Checking JWKS endpoint: ${jwksUri}`);
  const totalAttempts = 10;
  for (let attempt = 1; attempt <= totalAttempts; attempt++) {
      const res = await fetch(jwksUri);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      logger.log(
        `JWKS endpoint reachable (attempt ${attempt}/${totalAttempts})`
      );
      return true;

  }
  return false;
}
