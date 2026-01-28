import { AppLogger } from "@dike/common";
import { KeycloakService } from "./keycloak.service";

export async function bootstrapKeycloakClient(
  KeycloakService: KeycloakService,
  logger: AppLogger
) {
  logger.log(
    `Bootstrap Keycloak client ${KeycloakService.clientId} (${KeycloakService.clientName})`
  );

  const maxAttempts = 10;
  const delayMs = 10000;
  let attempt = 1;
  let success = false;

  while (attempt <= maxAttempts && !success) {
    try {
      await KeycloakService.createDikeClient();
      logger.log(
        `✅ Keycloak client [${KeycloakService.clientId} (${KeycloakService.clientName})] creato/verificato all'avvio`
      );
      success = true;
    } catch (err) {
      logger.log(
        `Tentativo ${attempt}/${maxAttempts}: Connessione a ${KeycloakService.baseUrl} fallita. Ritento...`
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
