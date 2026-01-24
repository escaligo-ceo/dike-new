import { AppLogger, DikeConfigService } from "@dike/common";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { AuditService } from "./audit/audit.service";
import { HttpAuditService } from "./audit/http.audit.service";

@Module({
  imports: [HttpModule],
  providers: [AppLogger, DikeConfigService, HttpAuditService, AuditService],
  exports: [AppLogger, DikeConfigService, HttpAuditService, AuditService],
})
export class CommunicationModule {}
