import { AppLogger, DikeConfigService } from "@dike/common";
import { KeycloakService as BaseKeycloakService } from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class KeycloakService extends BaseKeycloakService {
  constructor(
    httpService: HttpService,
    logger: AppLogger,
    configService: DikeConfigService
  ) {
    super(httpService as any, logger, configService);
  }
}
