import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchedPerson } from '../entities/watched-person.entity';
import { WatchedPersonService } from './watched-person.service';
import { ApiGatewayService } from './api-gateway.service';
import { UserFactory } from './user.factory';
import { HttpModule } from '@nestjs/axios';
import { AppLogger, DikeConfigService } from '@dike/common';

@Module({
  imports: [TypeOrmModule.forFeature([WatchedPerson]), HttpModule],
  providers: [WatchedPersonService, UserFactory, ApiGatewayService, AppLogger, DikeConfigService],
  exports: [WatchedPersonService]
})
export class WatchedPersonModule {}
