import { AppLogger } from "@dike/common";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserFactory {
  constructor(private readonly logger: AppLogger) {}

  // Add factory methods from the original UserFactory
}
