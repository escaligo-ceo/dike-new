import { AppLogger, DikeConfigService } from "@dike/common";
import { HttpAuditService, KeycloakService } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [HttpModule],
  providers: [
    HttpAuditService,
    KeycloakService,
    AppLogger,
    ConfigService,
    DikeConfigService,
  ],
  exports: [HttpAuditService, KeycloakService],
})
export class CommunicationModule {}
