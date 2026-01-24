import { HttpStatus, INestApplication } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("API Gateway (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: process.env.ENV === "e2e" ? ".env.e2e" : ".env.test",
          isGlobal: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer())
      .get("/")
      .expect(HttpStatus.OK)
      .expect({
        name: process.env.APP_NAME || "api-gateway",
        version: process.env.VERSION || "0.0.1",
        copyright: "Copyright © 2025 Escaligo s.r.l.",
      });
  });
});
