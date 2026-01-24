import { HttpStatus, INestApplication } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

describe("Web Site (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: process.env.ENV === "e2e" ? ".env.e2e" : ".env",
          isGlobal: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/ping (GET)", () => {
    return request(app.getHttpServer())
      .get("/ping")
      .expect(HttpStatus.OK)
      .expect({
        name: "web-site",
        version: "0.0.1",
        copyright: "Copyright © 2025 Escaligo s.r.l.",
      });
  });
});
