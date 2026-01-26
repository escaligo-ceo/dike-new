import { AppLogger } from "@dike/common";
import { Injectable } from "@nestjs/common";
import { ApiGatewayService } from "./api-gateway.service";

@Injectable()
export class UserFactory {
  constructor(
    private readonly logger: AppLogger,
    private readonly apiGatewayService: ApiGatewayService
  ) {}

  // Add your factory methods here
}
