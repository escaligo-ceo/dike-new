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
import { EmailModule } from "./email/email.module";
import { NotificationModule } from "./notification/notification.module";
import { PrefController } from "./pref/pref.controller";
import { PrefModule } from "./pref/pref.module";
import { TemplateLoaderModule } from "./template-loader/template-loader.module";
import { TestController } from "./test/test.controller";
import { ApiGatewayService, CommunicationModule, KeycloakService, UserFactory } from "@dike/communication";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DikeModule,
    CommunicationModule,
    DatabaseModule,
    AdminModule,
    EmailModule,
    NotificationModule,
    PrefModule,
    TemplateLoaderModule,
    HttpModule,
  ],
  controllers: [AppController, TestController, PrefController],
  providers: [
    AppService,
    AppLogger,
    {
      provide: APP_FILTER,
      useFactory: (logger: AppLogger) => new HttpServiceExceptionFilter(logger),
      inject: [AppLogger],
    },
    KeycloakService,
    DikeConfigService,
    ConfigService,
    UserFactory,
    ApiGatewayService,
    DikeJwtService,
  ],
})
export class AppModule {}
