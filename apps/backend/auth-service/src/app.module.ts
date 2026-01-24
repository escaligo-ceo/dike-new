import {
  AppLogger,
  DikeConfigService,
  HttpServiceExceptionFilter,
} from "@dike/common";
import {
  ApiGatewayService,
  AuditModule,
  KeycloakService,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminModule } from "./admin/admin.module";
import { AdminService } from "./admin/admin.service";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { CommunicationModule } from "./communication/communication.module";
import { HttpNotificationService } from "./communication/http.notification.service";
import { DatabaseModule } from "./database/database.module";
import { entities } from "./database/entites";
import { TokensModule } from "./tokens/tokens.module";
import { WatchedPersonModule } from "./watched-person/watched-person.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../.env", "../../.env", "../../../.env"],
    }),
    AuthModule,
    AdminModule,
    HttpModule,
    TokensModule,
    CommunicationModule,
    DatabaseModule,
    TypeOrmModule.forFeature(entities),
    WatchedPersonModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AdminService,
    AppLogger,
    HttpNotificationService,
    {
      provide: APP_FILTER,
      useFactory: (logger: AppLogger) => new HttpServiceExceptionFilter(logger),
      inject: [AppLogger],
    },
    DikeConfigService,
    KeycloakService,
    ConfigService,
    UserFactory,
    ApiGatewayService,
  ],
})
export class AppModule {}
