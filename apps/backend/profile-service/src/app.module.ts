import {
  AppLogger,
  DikeConfigService,
  DikeJwtService,
  DikeModule,
  HttpServiceExceptionFilter,
} from "@dike/common";
import { ApiGatewayService, CommunicationModule, UserFactory, KeycloakService } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, Reflector } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminModule } from "./admin/admin.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { entities } from "./database/entities";
import { OnboardingController } from "./onboarding/onboarding.controller";
import { OnboardingModule } from "./onboarding/onboarding.module";
import { ProfileModule } from "./profile/profile.module";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    DikeModule,
    CommunicationModule,
    DatabaseModule,
    AdminModule,
    ProfileModule,
    OnboardingModule,
    TypeOrmModule.forFeature(entities),
    HttpModule,
  ],
  controllers: [AppController, OnboardingController],
  providers: [
    AppService,
    AppLogger,
    Reflector,
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
