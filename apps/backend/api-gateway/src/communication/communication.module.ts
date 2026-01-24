import { AppLogger, DikeConfigService } from "@dike/common";
import {
  ApiGatewayService,
  AuditModule,
  AuditService,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { HttpAuthService } from "./http.auth.service";
import { HttpNotificationService } from "./http.notification.service";
import { HttpProfileService } from "./http.profile.service";
import { HttpProcessService } from "./http.process.service";

@Module({
  imports: [
    HttpModule,
    AuditModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
  ],
  providers: [
    HttpAuthService,
    AppLogger,
    ConfigService,
    DikeConfigService,
    HttpNotificationService,
    HttpProfileService,
    AuditService,
    UserFactory,
    ApiGatewayService,
    HttpProcessService,
  ],
  exports: [
    HttpAuthService,
    HttpNotificationService,
    HttpProfileService,
    HttpProcessService,
    AuditService,
    UserFactory,
    ApiGatewayService,
  ],
})
export class CommunicationModule {}
