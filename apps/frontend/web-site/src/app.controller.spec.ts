import { IPingResponse } from "@dike/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

const appName = process.env.APP_NAME || "web-site";
const VERSION = process.env.VERSION || "0.0.1";

describe("AppController", () => {
  let appController: AppController;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe("@dike/api-gateway", () => {
    it("should return app name, version and copyright info", () => {
      const response: IPingResponse = appController.ping();
      expect(response).toHaveProperty("name");
      expect(response).toHaveProperty("version");
      expect(response).toHaveProperty("copyright");
      expect(response.name).toBeDefined();
      expect(response.name).toBe(appName);
      expect(response.version).toBeDefined();
      expect(response.version).toBe(VERSION);
      expect(response.copyright).toBeDefined();
      const currentYear = new Date().getFullYear();
      const copyrightPeriod =
        currentYear > 2025 ? `2025-${currentYear}` : "2025";
      expect(response.copyright).toBe(
        `Copyright © ${copyrightPeriod} Escaligo s.r.l.`
      );
    });
  });
});
