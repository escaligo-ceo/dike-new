import {
  AppLogger,
  DikeConfigService,
  DikeJwtService,
  DikeModule,
  HttpServiceExceptionFilter,
} from "@dike/common";
import {
  ApiGatewayService,
  ForwardedHeadersMiddleware,
  KeycloakService,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, Reflector } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminModule } from "./admin/admin.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AccessModule } from "./access/access.module";
import { DatabaseModule } from "./database/database.module";
import { entities } from "./database/entites";
import { OnboardingModule } from "./onboarding/onboarding.module";
import { ProfileModule } from "./profile/profile.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    DikeModule,
    HttpModule,
    AdminModule,
    ProfileModule,
    // Ensure TypeORM DataSource is provided via forRootAsync
    DatabaseModule,
    TypeOrmModule.forFeature(entities),
    AccessModule,
    OnboardingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppLogger,
    DikeConfigService,
    Reflector,
    {
      provide: APP_FILTER,
      useFactory: (logger: AppLogger) => new HttpServiceExceptionFilter(logger),
      inject: [AppLogger],
    },
    KeycloakService,
    UserFactory,
    ApiGatewayService,
    DikeJwtService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ForwardedHeadersMiddleware).forRoutes("*");
  }
}
