import { AppLogger, DikeConfigService } from "@dike/common";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuditService } from "./audit.service";
import { HttpAuditService } from "./http.audit.service";

@Module({
  imports: [HttpModule],
  providers: [
    AuditService,
    HttpAuditService,
    AppLogger,
    ConfigService,
    DikeConfigService,
  ],
  exports: [AuditService, HttpAuditService],
})
export class AuditModule {}
