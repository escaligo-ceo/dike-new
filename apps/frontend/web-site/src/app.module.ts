import {
  AppLogger,
  DikeConfigService,
  DikeModule,
  DikeJwtService,
} from "@dike/common";
import {
  ApiGatewayService,
  AuditModule,
  KeycloakService,
  LoggedUserInterceptor,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_INTERCEPTOR, Reflector } from "@nestjs/core";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { OnboardingModule } from "./onboarding/onboarding.module";
import { PeopleController } from "./people/people.controller";
import { PeopleModule } from "./people/people.module";
import { ProfileModule } from "./profile/profile.module";
import { SettingsModule } from "./settings/settings.module";

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    DikeModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "../..", "src/public"),
      serveRoot: "/assets",
    }),
    SettingsModule,
    OnboardingModule,
    AuditModule,
    PeopleModule,
    ProfileModule,
  ],
  controllers: [AppController, PeopleController],
  providers: [
    AppService,
    AppLogger,
    DikeConfigService,
    ConfigService,
    Reflector,
    KeycloakService,
    ApiGatewayService,
    UserFactory,
    DikeJwtService,
    {
      provide: APP_INTERCEPTOR,
      useFactory: (userFactory: UserFactory) => {
        return new LoggedUserInterceptor(userFactory);
      },
      inject: [UserFactory],
    },
  ],
})
export class AppModule {}
