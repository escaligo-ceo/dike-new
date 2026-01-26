import { AppLogger, DikeConfigService, DikeJwtService } from "@dike/common";
import { CommunicationModule as CommunicationLibModule, JwtAuthGuard } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpNotificationService } from "./http.notification.service";
import { HttpProcessService } from "./http.process.service";

@Module({
  imports: [
    HttpModule,
    CommunicationLibModule.forRoot(),
  ],
  providers: [
    HttpNotificationService,
    HttpProcessService,
    AppLogger,
    ConfigService,
    DikeConfigService,
    DikeJwtService,
    JwtAuthGuard,
  ],
  exports: [
    HttpNotificationService,
    HttpProcessService,
    CommunicationLibModule,
    DikeJwtService,
  ],
})
export class CommunicationModule {}
