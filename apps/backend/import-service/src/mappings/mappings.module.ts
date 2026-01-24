import { AppLogger, DikeConfigService, DikeJwtService } from "@dike/common";
import { ApiGatewayService, KeycloakService, UserFactory, AuditModule } from "@dike/communication";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { entities } from "../database/entities";
import { MappingsController } from "./mappings.controller";
import { MappingsService } from "./mappings.service";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../.env", "../../.env", "../../../.env"],
    }),
    TypeOrmModule.forFeature(entities),
    AuditModule,
  ],
  providers: [
    MappingsService,
    AppLogger,
    DikeConfigService,
    ConfigService,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
    DikeJwtService,
  ],
  controllers: [MappingsController],
  exports: [MappingsService],
})
export class MappingsModule {}
