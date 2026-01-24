import { IPingResponse } from "@dike/common";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppModule } from "./app.module";

let controller: AppController;

describe("AppController", () => {
  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ".env",
        }),
        AppModule,
      ],
    }).compile();

    controller = app.get<AppController>(AppController);
  });

  describe("/ (GET)", () => {
    it("should return service info", () => {
      const response: IPingResponse = controller.ping();
      expect(response).toHaveProperty("name");
      expect(response.name).toBeDefined();
      expect(response.name).toBe("api-gateway");
      expect(response).toHaveProperty("version");
      expect(response.version).toBeDefined();
      expect(response.version).toBe(process.env.VERSION);
      expect(response).toHaveProperty("copyright");
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
