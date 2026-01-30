import { AppLogger, DikeJwtService, DikeModule } from "@dike/common";
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
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

@Module({
  exports: [],
  imports: [
    HttpModule,
    DikeModule,
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
    AppLogger,
    ProfileService,
    ApiGatewayService,
    KeycloakService,
    DikeJwtService,
    UserFactory,
  ],
})
export class ProfileModule {}
