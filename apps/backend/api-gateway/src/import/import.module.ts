import { AppLogger, DikeConfigService, DikeJwtService } from "@dike/common";
import {
  ApiGatewayService,
  AuditModule,
  KeycloakService,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { HttpImportService } from "../communication/http.import.service";
import { ContactController } from "./contact.controller";
import { ImportController } from "./import.controller";
import { MappingController } from "./mapping.controller";

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    AuditModule,
  ],
  controllers: [ImportController, MappingController, ContactController],
  providers: [
    HttpImportService,
    DikeJwtService,
    AppLogger,
    DikeConfigService,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
  ],
  exports: [],
})
export class ImportModule {}
