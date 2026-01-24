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
import { InternalTenantController } from "./internal-tenant.controller";
import { OfficeService } from "./office.service";
import { TenantController } from "./tenant.controller";
import { TenantService } from "./tenant.service";

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
    TenantService,
    AppLogger,
    TeamService,
    OfficeService,
    ApiGatewayService,
    ConfigService,
    DikeConfigService,
    UserFactory,
    KeycloakService,
    DikeJwtService,
  ],
  controllers: [TenantController, InternalTenantController],
  exports: [TenantService],
})
export class TenantModule {}
