import { AppLogger, DikeJwtService, DikeModule, VerificationTokenService } from '@dike/common';
import { ApiGatewayService, AuditModule, UserFactory, KeycloakService } from '@dike/communication';
import { HttpModule } from "@nestjs/axios";
import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { AppService } from '../app.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    DikeModule,
    HttpModule,
    ConfigModule,
    AuditModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    AppLogger,
    AppService,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
    VerificationTokenService,
    JwtService,
    DikeJwtService,
  ]
})
export class AdminModule {}
