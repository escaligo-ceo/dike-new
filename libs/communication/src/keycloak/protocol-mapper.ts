import { AppLogger } from "@dike/common";
import { KeycloakService } from "./keycloak.service";

export async function createKeycloakProtocolMapper(
  KeycloakService: KeycloakService,
  logger: AppLogger,
  desiredConfig: Record<string, any> = {
    "user.attribute": "tenantId",
    "claim.name": "tenantId",
    "jsonType.label": "String",
    "id.token.claim": true,
    "access.token.claim": true,
    "userinfo.token.claim": true,
  }
) {
  // Bootstrap Keycloak client dike-cli con retry
  logger.log(
    `Bootstrap Keycloak client ${KeycloakService.clientId} (${KeycloakService.clientName})`
  );

  const maxAttempts = 10;
  const delayMs = 10000;
  let attempt = 1;
  let success = false;

  while (attempt <= maxAttempts && !success) {
    try {
      const existingMappers = await KeycloakService.getMappers(
        KeycloakService.clientId
      );
      const mapper = existingMappers.find(
        (m) => m.name === "dike-tenant-id-mapper"
      );

      if (mapper) {
        // opzionale: update mapper se vuoi essere sicuro della config
        await KeycloakService.updateMapper(
          KeycloakService.clientId,
          mapper.id,
          desiredConfig
        );
      } else {
        await KeycloakService.createMapper(
          KeycloakService.clientId,
          desiredConfig
        );
      }

      logger.log(
        `✅ Keycloak protocol mapper [${KeycloakService.clientId} (${KeycloakService.clientName})] creato/aggiornato all'avvio`
      );
      success = true;
    } catch (err) {
      logger.log(
        `Tentativo ${attempt}/${maxAttempts}: Keycloak non sembra ancora attivo o non risponde correttamente. Ritento tra ${delayMs / 1000} secondi...`
      );
      if (attempt === maxAttempts) {
        logger.error(
          `❌ Errore nella creazione/verifica del client [${KeycloakService.clientId} (${KeycloakService.clientName})] su Keycloak dopo ${maxAttempts} tentativi. Interrompo i retry.`
        );
        break;
      }
      await new Promise((res) => setTimeout(res, delayMs));
      attempt++;
    }
  }
}
