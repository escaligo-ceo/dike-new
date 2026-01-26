import {
  AppLogger,
  DikeModule,
  HttpServiceExceptionFilter,
} from "@dike/common";
import {
  CommunicationModule,
  LoggedUserInterceptor,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { AdminModule } from "./admin/admin.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    DikeModule,
    CommunicationModule.forRoot(),
    DatabaseModule,
    AdminModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
  ],
})
export class AppModule {}
