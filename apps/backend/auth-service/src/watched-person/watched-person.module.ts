import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchedPerson } from '../entities/watched-person.entity';
import { WatchedPersonService } from './watched-person.service';
import { ApiGatewayService, UserFactory } from '@dike/communication';
import { HttpModule } from '@nestjs/axios';
import { AppLogger } from '@dike/common';

@Module({
  imports: [TypeOrmModule.forFeature([WatchedPerson]), HttpModule],
  providers: [WatchedPersonService, UserFactory, ApiGatewayService, AppLogger],
  exports: [WatchedPersonService]
})
export class WatchedPersonModule {}
