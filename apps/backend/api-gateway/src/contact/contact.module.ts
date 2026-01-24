import { AppLogger, DikeConfigService, DikeJwtService } from "@dike/common";
import {
  ApiGatewayService,
  AuditModule,
  KeycloakService,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { HttpContactService } from "../communication/http.contact.service";
import { HttpImportService } from "../communication/http.import.service";
import { ContactController } from "./contact.controller";

@Module({
  imports: [HttpModule, AuditModule],
  controllers: [ContactController],
  providers: [
    AppLogger,
    HttpContactService,
    HttpImportService,
    DikeConfigService,
    UserFactory,
    ApiGatewayService,
    KeycloakService,
    DikeJwtService,
  ],
})
export class ContactModule {}
