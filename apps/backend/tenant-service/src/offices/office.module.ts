import { AppLogger, DikeConfigService, DikeJwtService } from '@dike/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from '../database/entities';
import { OfficeService } from './office.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ApiGatewayService, AuditModule, KeycloakService, UserFactory } from '@dike/communication';
import { InternalOfficeController } from './internal-office.controller';
import { OfficeController } from './offices.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    AuditModule,
    HttpModule,
    ConfigModule,
  ],
  controllers: [InternalOfficeController, OfficeController],
  providers: [
    OfficeService,
    AppLogger,
    ApiGatewayService,
    DikeConfigService,
    KeycloakService,
    UserFactory,
    DikeJwtService,
  ],
  exports: [OfficeService],
})
export class OfficeModule {}
