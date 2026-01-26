import { AppLogger, DikeConfigService } from "@dike/common";
import { BaseHttpService } from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class HttpAuditService extends BaseHttpService {
  constructor(
    httpService: HttpService,
    logger: AppLogger,
    configService: DikeConfigService
  ) {
    super(
      httpService as any,
      new AppLogger(HttpAuditService.name),
      configService,
      configService.env("AUDIT_SERVICE_URL", "http://localhost:8006/api")
    );
  }
}
