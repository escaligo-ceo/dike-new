import { AppLogger, DikeConfigService, EmailVerificationToken } from "@dike/common";
import { ApiGatewayService, HttpAuditService, UserFactory, KeycloakService } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokensController } from "./tokens.controller";

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([EmailVerificationToken])],
  exports: [], // Esporta il repository se vuoi usarlo altrove
  controllers: [TokensController],
  providers: [
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
