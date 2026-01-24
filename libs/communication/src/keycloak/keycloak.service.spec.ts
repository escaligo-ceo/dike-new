import { AppLogger } from "@dike/common";
import { HttpModule, HttpService } from "@nestjs/axios";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { KeycloakService } from "./keycloak.service";
import { DikeConfigService } from "../app/load-env-value";

describe("KeycloakService", () => {
  let service: KeycloakService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [KeycloakService, AppLogger],
    }).compile();

    service = module.get<KeycloakService>(KeycloakService);
    httpService = module.get<HttpService>(HttpService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should get admin token", async () => {
    const service = new KeycloakService(
      httpService,
      new AppLogger(),
      new DikeConfigService()
    );
    const token = await service.getAdminToken();
    expect(token).toBeDefined();
    expect(token.access_token).toEqual(expect.any(String));
  });
});
