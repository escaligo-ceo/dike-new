import { DynamicModule, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { AppLogger, DikeConfigService, DikeJwtService, DikeModule } from "@dike/common";
import { KeycloakService } from "./keycloak/keycloak.service";
import { HttpAuditService } from "./audit/http.audit.service";
import { ApiGatewayService } from "./api-gateway.service";
import { UserFactory } from "./user/user-factory";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Module({})
export class CommunicationModule {
  static forRoot(): DynamicModule {
    return {
      module: CommunicationModule,
      global: true,
      imports: [
        HttpModule,
        ConfigModule,
        DikeModule,
      ],
      providers: [
        KeycloakService,
        HttpAuditService,
        ApiGatewayService,
        UserFactory,
      ],
      exports: [
        HttpModule,
        KeycloakService,
        HttpAuditService,
        ApiGatewayService,
        UserFactory,
      ],
    };
  }
}
