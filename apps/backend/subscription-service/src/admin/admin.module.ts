import { AppLogger, DikeConfigService, DikeJwtService, VerificationTokenService } from "@dike/common";
import {
  ApiGatewayService,
  AuditModule,
  KeycloakService,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppService } from "../app.service";
import { entities } from "../database/entities";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    AuditModule,
    HttpModule,
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
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
    ConfigService,
    VerificationTokenService,
    JwtService,
    DikeJwtService,
  ],
  exports: [AdminService],
})
export class AdminModule {}
