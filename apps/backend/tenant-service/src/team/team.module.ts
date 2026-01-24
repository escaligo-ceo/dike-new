import { AppLogger, DikeConfigService, DikeJwtService } from '@dike/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from '../database/entities';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ApiGatewayService, AuditModule, KeycloakService, UserFactory } from '@dike/communication';
import { InternalTeamController } from './internal-team.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    AuditModule,
    HttpModule,
    ConfigModule,
  ],
  controllers: [InternalTeamController, TeamController],
  providers: [
    TeamService,
    AppLogger,
    ApiGatewayService,
    DikeConfigService,
    KeycloakService,
    UserFactory,
    DikeJwtService,
  ],
  exports: [TeamService],
})
export class TeamModule {}
