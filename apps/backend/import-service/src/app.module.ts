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
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HttpContactService } from "./communication/http.contact.service";
import { DatabaseModule } from "./database/database.module";
import { entities } from "./database/entities";
import { ImportModule } from "./import/import.module";
import { ImportsService } from "./import/imports.service";
import { MappingsModule } from "./mappings/mappings.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    AdminModule,
    HttpModule,
    DatabaseModule,
    TypeOrmModule.forFeature(entities),
    AuditModule,
    MappingsModule,
    ImportModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppLogger,
    ApiGatewayService,
    UserFactory,
    HttpContactService,
    {
      provide: APP_FILTER,
      useFactory: (logger: AppLogger) => new HttpServiceExceptionFilter(logger),
      inject: [AppLogger],
    },
    KeycloakService,
    ConfigService,
    DikeConfigService,
    ImportsService,
  ],
})
export class AppModule {}
