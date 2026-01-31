import {
  AppLogger,
  BaseUrl,
  DikeConfigService,
  inspect,
} from "@dike/common";
import { HttpStatus } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import session from "express-session";
import * as nunjucks from "nunjucks";
import { join } from "path";
import { AppModule } from "./app.module";
import { checkKeycloakConnection } from "@dike/communication";

export let logger: AppLogger = new AppLogger("www");

(async () => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(DikeConfigService);

  // Configura body parser per form HTML (urlencoded)
  app.use(require("express").urlencoded({ extended: false }));
  // Configura cookie parser
  app.use(cookieParser());
  // CSRF protection
  app.use(
    csurf({
      cookie: {
        key: "csurf-token",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      },
    })
  );

  const ENV = configService.env("ENV", "development");

  const appName = configService.env("APP_NAME", "www");

  logger = new AppLogger(appName);

  logger.log(`App name: ${appName}`);

  logger.log(`Node environment: ${ENV}`);

  const appUrl = configService.env("WWW_URL");
  logger.log(`App URL: ${appUrl}`);

  const appUrlApi = `${appUrl}/api`;
  logger.log(`API URL: ${appUrlApi}`);

  const appUrlParams = new BaseUrl(appUrl);
  const PORT = appUrlParams.port;
  logger.log(`Port: ${PORT}`);

  const VERSION = configService.env("VERSION", "0.0.1");
  logger.log(`Version: ${VERSION}`);

  // VIEWS
  const viewsPath = join(__dirname, "../..", "src/views");
  logger.debug(`VIEW: ${viewsPath}`);
  app.set("views", viewsPath);
  // app.useStaticAssets(join(__dirname, '../..', 'public'), {
  //   prefix: '/public',
  // });
  // logger.debug(`static asstes: ${join(__dirname, '..', 'public')}`);

  // Configura Nunjucks + custom filters
  const nunjucksEnv = nunjucks.configure(viewsPath, {
    autoescape: true,
    express: app.getHttpAdapter().getInstance(),
    watch: true,
    noCache: true,
  });

  // Simple date formatting filter supporting common patterns (e.g. 'DD/MM/YYYY')
  nunjucksEnv.addFilter(
    "date",
    (value: any, format: string = "YYYY-MM-DD HH:mm:ss") => {
      if (!value) return "N/A";
      const d = new Date(value);
      if (isNaN(d.getTime())) return "N/A";
      const pad = (n: number) => String(n).padStart(2, "0");
      const day = pad(d.getDate());
      const month = pad(d.getMonth() + 1);
      const year = d.getFullYear();
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      const seconds = pad(d.getSeconds());
      // Minimal token replacement
      let out = format
        .replace(/DD/g, day)
        .replace(/MM/g, month)
        .replace(/YYYY/g, String(year))
        .replace(/HH/g, hours)
        .replace(/mm/g, minutes)
        .replace(/ss/g, seconds);
      // If format not recognized, fallback to locale string
      if (out === format) {
        out = d.toLocaleString();
      }
      return out;
    }
  );

  app.setBaseViewsDir(viewsPath);
  app.setViewEngine("njk");

  // ERROR Handling
  app.use((err, req, res, next) => {
    if (err.code === "EBADCSRFTOKEN") {
      // Renderizza una pagina di errore CSRF custom
      return res.status(HttpStatus.FORBIDDEN).render("errors/csrf-error", {
        message: "Token CSRF non valido o mancante.",
      });
    } else if (err.status === HttpStatus.NOT_FOUND) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .render("errors/404", { message: "Pagina non trovata." });
    }
    inspect(err);
    next(err);
  });

  // Check Keycloak connection before starting the app
  await checkKeycloakConnection(configService, new AppLogger("Keycloak check"));

  logger.log(`Application '${appName}' is running on: ${appUrl}`);
  logger.debug(`HEALTH: ${appUrl}/ping`);
  logger.log(`🚀 Server avviato su ${appUrl} in ${ENV} mode`);

  const sessionSecret = configService.env("SESSION_SECRET");
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true, // evita accesso JS
        secure: ENV === "production", // solo HTTPS in produzione
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1 ora
      },
    })
  );

  await app.listen(PORT);

  // const apiGatewayService = app.get<ApiGatewayService>(ApiGatewayService);
  // if (!apiGatewayService) {
  //   throw new Error('ApiGatewayService is not available');
  // }
  // logger.log('ApiGatewayService is available');
  // // Ping the API Gateway to check if it's active
  // await apiGatewayService.ping();

  // await bootstrapKeycloakClient(app.get(KeycloakService), logger);
  // await createKeycloakProtocolMapper(app.get(KeycloakService), logger);
})();
