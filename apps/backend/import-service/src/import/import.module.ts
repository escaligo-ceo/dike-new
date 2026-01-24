import { AppLogger, DikeJwtService, Mapping } from "@dike/common";
import {
  ApiGatewayService,
  AuditModule,
  KeycloakService,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HttpContactService } from "../communication/http.contact.service";
import { MappingsModule } from "../mappings/mappings.module";
import { ImportsController } from "./imports.controller";
import { ImportsService } from "./imports.service";

@Module({
  imports: [
    HttpModule,
    AuditModule,
    MappingsModule,
    TypeOrmModule.forFeature([Mapping]),
  ],
  controllers: [ImportsController],
  providers: [
    AppLogger,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
    HttpContactService,
    ImportsService,
    DikeJwtService,
  ],
  exports: [],
})
export class ImportModule {}
