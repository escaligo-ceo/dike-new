import { AppLogger, DikeJwtService, DikeModule } from '@dike/common';
import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { HttpModule } from '@nestjs/axios';
import { ApiGatewayService, AuditModule, KeycloakService, UserFactory } from '@dike/communication';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    DikeModule,
    EmailModule,
    HttpModule,
    AuditModule,
        ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    AppLogger,
    ApiGatewayService,
    KeycloakService,
    UserFactory,
    DikeJwtService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
