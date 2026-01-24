import {
  AppLogger,
  DikeConfigService,
  HttpServiceExceptionFilter,
} from "@dike/common";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminModule } from "./admin/admin.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { entities } from "./database/entities";
import { TeamModule } from "./team/team.module";
import { TenantModule } from "./tenant/tenant.module";
import { MembershipsModule } from "./memberships/memberships.module";
import { OfficeModule } from "./offices/office.module";

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
    TeamModule,
    TenantModule,
    MembershipsModule,
    AdminModule,
    OfficeModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppLogger,
    {
      provide: APP_FILTER,
      useFactory: (logger: AppLogger) => new HttpServiceExceptionFilter(logger),
      inject: [AppLogger],
    },
    DikeConfigService,
    ConfigService,
  ],
})
export class AppModule {}
