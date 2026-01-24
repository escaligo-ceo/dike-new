import { AppLogger, DikeConfigService, DikeJwtService, User } from "@dike/common";
import { ApiGatewayService, AuditModule, UserFactory, KeycloakService } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { HttpProfileService } from "../communication/http.profile.service";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

@Module({
  exports: [ProfileService, HttpProfileService],
  imports: [
    HttpModule,
    AuditModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [ProfileController],
  providers: [
    HttpProfileService,
    AppLogger,
    ProfileService,
    ConfigService,
    DikeConfigService,
    KeycloakService,
    UserFactory,
    ApiGatewayService,
    DikeJwtService,
  ],
})
export class ProfileModule {}
