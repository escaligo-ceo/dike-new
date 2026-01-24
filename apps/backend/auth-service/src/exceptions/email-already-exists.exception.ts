import { ConflictException } from "@nestjs/common";

export class EmailAlreadyExistsException extends ConflictException {
  constructor() {
    super("Email già registrata");
  }
}
