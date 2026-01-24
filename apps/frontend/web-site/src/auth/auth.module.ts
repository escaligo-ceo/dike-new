import { AppLogger, DikeConfigService, JwtStrategy } from '@dike/common';
import { ApiGatewayService, UserFactory } from '@dike/communication';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [ConfigModule, HttpModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AppLogger,
    JwtStrategy,
    ApiGatewayService,
    DikeConfigService,
    ConfigService,
    UserFactory,
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
