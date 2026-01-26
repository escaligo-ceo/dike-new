import { AppLogger, DikeConfigService } from "@dike/common";
import { BaseHttpService } from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ApiGatewayService extends BaseHttpService {
  constructor(
    httpService: HttpService,
    logger: AppLogger,
    configService: DikeConfigService
  ) {
    super(
      httpService as any,
      new AppLogger(ApiGatewayService.name),
      configService,
      configService.env("API_GATEWAY_URL", "http://localhost:3000/api")
    );
  }
}
