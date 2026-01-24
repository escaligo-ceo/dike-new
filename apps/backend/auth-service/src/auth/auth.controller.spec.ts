import { AppLogger, RegisterUserDto } from "@dike/common";
import { HttpAuditService } from "@dike/communication";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthModule } from "./auth.module";
import { AuthService } from "./auth.service";
import { KeycloakService } from "./keycloak.service";

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, HttpModule, ConfigModule],
      controllers: [AuthController],
      providers: [AuthService, HttpAuditService, KeycloakService, AppLogger],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should register a user", async () => {
    const mockRegisterDto: RegisterUserDto = {
      username: "testuser",
      email: "test@dike.cloud",
      password: "testpassword",
    };
    const mockResponse = {
      userId: "mock-user-id",
      email: "test@dike.cloud",
      username: "testuser",
      link: "https://dike.cloud/verify?token=mock-token",
      token: "mock-token",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };
    jest
      .spyOn(controller["authService"], "register")
      .mockResolvedValue(mockResponse);
    const result = await controller.register(mockRegisterDto);
    // const mockIp = '127.0.0.1';
    // const mockUserAgent = 'jest-test-agent';
    // expect(controller['authService'].registerUser).toHaveBeenCalledWith(mockIp, mockUserAgent, mockRegisterDto);
    expect(result).toEqual(mockResponse);
    expect(controller["authService"].register).toHaveBeenCalledWith(
      mockRegisterDto
    );
  });
});
