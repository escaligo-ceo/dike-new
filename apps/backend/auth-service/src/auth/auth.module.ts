import {
  AppLogger,
  DikeConfigService,
  DikeJwtService,
  VerificationTokenService,
  EmailVerificationToken,
} from "@dike/common";
import { AuditModule, AuditService } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommunicationModule } from "../communication/communication.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailVerificationToken]),
    HttpModule,
    CommunicationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1h" },
    }),
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    VerificationTokenService,
    AppLogger,
    ConfigService,
    DikeConfigService,
    AuditService,
    DikeJwtService,
  ],
  exports: [VerificationTokenService],
})
export class AuthModule {}
