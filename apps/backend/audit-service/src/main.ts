import {
  AppLogger,
  BaseUrl,
  DikeConfigService,
  initializeViewEngine,
} from "@dike/common";
import { RequestMethod, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

export let logger: AppLogger;

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(DikeConfigService);

  const ENV = configService.env("ENV", "development");

  const appName = configService.env("APP_NAME", "audit-service");

  logger = new AppLogger(appName);

  logger.log(`App name: ${appName}`);

  logger.log(`Node environment: ${ENV}`);

  const appUrl = configService.env("APP_URL");
  logger.log(`App URL: ${appUrl}`);

  const appUrlApi = `${appUrl}/api`;
  logger.log(`API URL: ${appUrlApi}`);

  const appUrlParams = new BaseUrl(appUrl);
  const PORT = appUrlParams.port;
  logger.log(`Port: ${PORT}`);

  const VERSION = configService.env("VERSION", "0.0.1");
  logger.log(`Version: ${VERSION}`);

  // API VERSIONING
  app.setGlobalPrefix("api", {
    exclude: [
      { path: "/", method: RequestMethod.GET },
      { path: "/admin/*", method: RequestMethod.GET },
      { path: "/admin/*", method: RequestMethod.POST },
    ],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  // Swagger
  logger.log("📦 Avvio inizializzazione Swagger.");
  const config = new DocumentBuilder()
    .setTitle("Audit Service")
    .setDescription("Documentazione Swagger per il servizio di audit")
    .setVersion(VERSION)
    // .addServer("/api/v1")
    .addBearerAuth() // Aggiunge il supporto all'Authorization: Bearer <token>
    .addTag("audit")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  if (ENV !== "production") {
    SwaggerModule.setup("swagger", app, document);
  }

  // VIEWS
  initializeViewEngine(__dirname, app, logger);

  logger.log(`Application '${appName}' is running on: ${appUrl}`);
  logger.debug(`HEALTH: ${appUrl}`);
  logger.debug(`API: ${appUrlApi}`);
  logger.log(`🚀 Server avviato su ${appUrlApi} in ${ENV} mode`);

  await app.listen(PORT);
})();
