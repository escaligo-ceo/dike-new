import { AppLogger, DikeConfigService, DikeJwtService, VerificationTokenService } from "@dike/common";
import { ApiGatewayService, AuditModule, KeycloakService, UserFactory } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppService } from "../app.service";
import { entities } from "../database/entities";
import { ProfileModule } from "../profile/profile.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    AuditModule,
    HttpModule,
    ConfigModule,
    ProfileModule,
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    AppLogger,
    DikeConfigService,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
    AppService,
    VerificationTokenService,
    JwtService,
    DikeJwtService,
  ],
})
export class AdminModule {}
