import {
  AppLogger,
  DikeConfigService,
  HttpServiceExceptionFilter
} from "@dike/common";
import { ApiGatewayService, AuditModule, KeycloakService, UserFactory } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminModule } from "./admin/admin.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ContactController } from "./contact/contact.controller";
import { ContactModule } from "./contact/contact.module";
import { ContactService } from "./contact/contact.service";
import { DatabaseModule } from "./database/database.module";
import { entities } from "./database/entities";
import { MappingsController } from "./mappings/mappings.controller";
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
    ContactModule,
    AuditModule,
    MappingsModule,
  ],
  controllers: [AppController, ContactController, MappingsController],
  providers: [
    AppService,
    AppLogger,
    ApiGatewayService,
    {
      provide: APP_FILTER,
      useFactory: (logger: AppLogger) => new HttpServiceExceptionFilter(logger),
      inject: [AppLogger],
    },
    ContactService,
    KeycloakService,
    ConfigService,
    DikeConfigService,
    UserFactory,
    ApiGatewayService,
  ],
})
export class AppModule {}
