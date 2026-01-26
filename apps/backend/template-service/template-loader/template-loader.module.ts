import { AppLogger, DikeConfigService, DikeJwtService } from "@dike/common";
import {
  ApiGatewayService,
  AuditModule,
  KeycloakService,
  UserFactory,
} from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { entities } from "../database/entites";
import { ResourceService } from "./resource.service";
import { TemplateLoaderController } from "./template-loader.controller";
import { TemplateLoaderService } from "./template-loader.service";

@Module({
  imports: [
    TypeOrmModule.forFeature(entities),
    AuditModule,
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [TemplateLoaderController],
  providers: [
    AppLogger,
    TemplateLoaderService,
    ResourceService,
    DikeConfigService,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
    DikeJwtService,
  ],
  exports: [TemplateLoaderService, ResourceService],
})
export class TemplateLoaderModule {}
