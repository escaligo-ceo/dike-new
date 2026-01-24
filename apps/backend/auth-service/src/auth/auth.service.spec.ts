import { AppLogger } from "@dike/common";
import { HttpAuditService, KeycloakService } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthModule } from "./auth.module";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, HttpModule, ConfigModule],
      providers: [AuthService, HttpAuditService, KeycloakService, AppLogger],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
