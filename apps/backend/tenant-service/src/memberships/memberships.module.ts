import { AppLogger, DikeConfigService, DikeJwtService } from "@dike/common";
import {
  ApiGatewayService,
  AuditModule,
  KeycloakService,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { entities } from "../database/entities";
import { TeamService } from "../team/team.service";
import { MembershipsController } from "./memberships.controller";
import { MembershipsService } from "./memberships.service";

@Module({
  imports: [
    AuditModule,
    TypeOrmModule.forFeature(entities),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
    HttpModule,
  ],
  providers: [
    AppLogger,
    TeamService,
    MembershipsService,
    ApiGatewayService,
    ConfigService,
    DikeConfigService,
    UserFactory,
    KeycloakService,
    DikeJwtService,
  ],
  controllers: [MembershipsController],
  exports: [MembershipsService],
})
export class MembershipsModule {}
