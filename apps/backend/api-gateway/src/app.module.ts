import {
  AppLogger,
  DikeConfigService,
  DikeModule,
  HttpServiceExceptionFilter,
} from "@dike/common";
import { ApiGatewayService, ForwardedHeadersMiddleware, KeycloakService, UserFactory } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, Reflector } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { ContactModule } from "./contact/contact.module";
import { ImportModule } from "./import/import.module";
import { NotificationModule } from "./notification/notification.module";
import { OnboardingModule } from "./onboarding/onboarding.module";
import { ProfileModule } from "./profile/profile.module";
import { SettingsModule } from "./settings/settings.module";
import { SubscriptionModule } from "./subscription/subscription.module";
import { TenantModule } from "./tenant/tenant.module";
import { AdminModule } from "./admin/admin.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    DikeModule,
    AuthModule,
    TenantModule,
    NotificationModule,
    ProfileModule,
    SettingsModule,
    OnboardingModule,
    SubscriptionModule,
    ContactModule,
    ImportModule,
    HttpModule,
    AdminModule,
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
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ForwardedHeadersMiddleware).forRoutes("*");
  }
}
