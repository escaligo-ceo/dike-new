import { ConflictException } from "@nestjs/common";

export class KeycloakConnectionException extends ConflictException {
  constructor() {
    super("Errore di connessione a Keycloak");
  }
}
