import {
  AppLogger,
  DikeConfigService,
  HttpServiceExceptionFilter,
} from "@dike/common";
import {
  ApiGatewayService,
  AuditModule,
  AuditService,
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
import { DatabaseModule } from "./database/database.module";
import { entities } from "./database/entites";
import { LogModule } from "./log/log.module";
import { LogService } from "./log/log.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    AuditModule,
    AdminModule,
    HttpModule,
    DatabaseModule,
    TypeOrmModule.forFeature(entities),
    LogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppLogger,
    ApiGatewayService,
    UserFactory,
    {
      provide: APP_FILTER,
      useFactory: (logger: AppLogger) => new HttpServiceExceptionFilter(logger),
      inject: [AppLogger],
    },
    LogService,
    AuditService,
    DikeConfigService,
    ConfigService,
  ],
})
export class AppModule {}
