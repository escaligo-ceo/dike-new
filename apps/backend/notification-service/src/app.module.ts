import {
  AppLogger,
  DikeConfigService,
  DikeJwtService,
  DikeModule,
  HttpServiceExceptionFilter,
} from "@dike/common";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { AdminModule } from "./admin/admin.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { EmailModule } from "./channels/email/email.module";
import { NotificationModule } from "./notification/notification.module";
import { PrefModule } from "./pref/pref.module";
import { ApiGatewayService, CommunicationModule, KeycloakService, UserFactory } from "@dike/communication";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DikeModule,
    CommunicationModule.forRoot(),
    DatabaseModule,
    AdminModule,
    EmailModule,
    NotificationModule,
    PrefModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useFactory: (logger: AppLogger) => new HttpServiceExceptionFilter(logger),
      inject: [AppLogger],
    },
  ],
})
export class AppModule {}
