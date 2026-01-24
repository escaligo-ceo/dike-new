import { AppLogger, DikeConfigService } from "@dike/common";
import { ApiGatewayService, AuditModule, UserFactory } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpNotificationService } from "../communication/http.notification.service";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";

@Module({
  imports: [HttpModule, AuditModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    ConfigService,
    DikeConfigService,
    AppLogger,
    HttpNotificationService,
    UserFactory,
    ApiGatewayService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
