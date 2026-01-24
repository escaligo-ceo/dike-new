import {
  AppLogger,
  DikeConfigService,
  DikeJwtService,
  HttpServiceExceptionFilter,
  VerificationTokenService,
} from "@dike/common";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminController } from "../admin/admin.controller";
import { AdminModule } from "../admin/admin.module";
import { AdminService } from "../admin/admin.service";
import { AppController } from "../app.controller";
import { AppService } from "../app.service";
import { entities } from "../database/entites";
import { LogController } from "./log.controller";
import { LogService } from "./log.service";
import { DatabaseModule } from "../database/database.module";
import { HttpModule } from "@nestjs/axios";
import { ApiGatewayService, AuditModule, KeycloakService, UserFactory } from "@dike/communication";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../.env", "../../.env", "../../../.env"],
    }),
    AdminModule,
    DatabaseModule,
    TypeOrmModule.forFeature(entities),
    HttpModule,
    AuditModule,
  ],
  providers: [
    AppService,
    LogService,
    AppLogger,
    AdminService,
    {
      provide: APP_FILTER,
      useFactory: (logger: AppLogger) => new HttpServiceExceptionFilter(logger),
      inject: [AppLogger],
    },
    DikeConfigService,
    ConfigService,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
    VerificationTokenService,
    JwtService,
    DikeJwtService,
  ],
  controllers: [AppController, LogController, AdminController],
})
export class LogModule {}
