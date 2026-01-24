import {
  AppLogger,
  DikeConfigService,
  HttpServiceExceptionFilter,
} from "@dike/common";
import {
  ApiGatewayService,
  KeycloakService,
  LoggedUserInterceptor,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminModule } from "./admin/admin.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";
import { entities } from "./database/entities";
import { FeatureModule } from "./feature/feature.module";
import { PlanModule } from "./plan/plan.module";
import { PlanService } from "./plan/plan.service";
import { SubscriptionModule } from "./subscription/subscription.module";
import { TenantModule } from "./tenant/tenant.module";

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
    TenantModule,
    PlanModule,
    FeatureModule,
    SubscriptionModule,
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
    {
      provide: APP_INTERCEPTOR,
      useFactory: (userFactory: UserFactory) => {
        return new LoggedUserInterceptor(userFactory);
      },
      inject: [UserFactory],
    },
    PlanService,
    DikeConfigService,
    ConfigService,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
  ],
})
export class AppModule {}
