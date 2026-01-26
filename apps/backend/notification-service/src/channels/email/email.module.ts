import { AppLogger, DikeJwtService, DikeModule } from "@dike/common";
import { ApiGatewayService, UserFactory, KeycloakService } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { entities } from "../../database/entites";
import { EmailTemplateController } from "./email-template.controller";
import { EmailController } from "./email.controller";
import { EmailChannel } from "./email.service";

@Module({
  imports: [
    DikeModule,
    HttpModule,
    TypeOrmModule.forFeature(entities),
  ],
  controllers: [EmailController, EmailTemplateController],
  providers: [
    EmailChannel,
    // TemplateLoaderService, // FIXME: da sistemare quando si integra TemplateLoaderService
  ],
  exports: [
    EmailChannel,
    //TemplateLoaderService,
  ],
})
export class EmailModule {}
