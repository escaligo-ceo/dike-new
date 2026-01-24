import { ConflictException } from "@nestjs/common";

export class KeycloakException extends ConflictException {
  constructor(msg: string) {
    if (msg) {
      const message = `Keycloak: ${msg}`;
      super(message);
    } else {
      super("Errore Keycloak");
    }
  }
}
