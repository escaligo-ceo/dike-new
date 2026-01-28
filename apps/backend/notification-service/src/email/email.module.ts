import { AppLogger, DikeJwtService, DikeModule } from "@dike/common";
import { ApiGatewayService, UserFactory, KeycloakService } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { entities } from "../database/entites";
import { TemplateLoaderService } from "../template-loader/template-loader.service";
import { EmailTemplateController } from "./email-template.controller";
import { EmailController } from "./email.controller";
import { EmailChannel } from "./email.service";

@Module({
  imports: [
    DikeModule,
    HttpModule,
    TypeOrmModule.forFeature(entities),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [EmailController, EmailTemplateController],
  providers: [
    EmailChannel,
    TemplateLoaderService,
    AppLogger,
    ApiGatewayService,
    KeycloakService,
    UserFactory,
    DikeJwtService,
  ],
  exports: [EmailChannel, TemplateLoaderService],
})
export class EmailModule {}
