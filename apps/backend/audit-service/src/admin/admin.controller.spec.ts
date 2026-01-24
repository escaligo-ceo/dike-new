import { AppLogger } from "@dike/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { KeycloakService } from "../communication/keycloak.service";
import { AdminController } from "./admin.controller";
import { AdminModule } from "./admin.module";

describe("AdminController", () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AdminModule, HttpModule, ConfigModule],
      controllers: [AdminController],
      providers: [KeycloakService, AppLogger],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
