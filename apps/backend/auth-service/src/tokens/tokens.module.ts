import { AppLogger, DikeConfigService } from "@dike/common";
import { ApiGatewayService, HttpAuditService, UserFactory, KeycloakService } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmailVerificationToken } from "../entities/email-verification-token.entity";
import { TokensController } from "./tokens.controller";
import { TokensService } from "./tokens.service";

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([EmailVerificationToken])],
  exports: [], // Esporta il repository se vuoi usarlo altrove
  controllers: [TokensController],
  providers: [
    TokensService,
    AppLogger,
    HttpAuditService,
    KeycloakService,
    ConfigService,
    DikeConfigService,
    UserFactory,
    ApiGatewayService,
  ],
})
export class TokensModule {}
