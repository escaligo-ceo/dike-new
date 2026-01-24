import { join } from "path";
import nunjucks from "nunjucks";
import { AppLogger } from "./logger.js";
import { NestExpressApplication } from "@nestjs/platform-express";

export function initializeViewEngine(
  dirname: string,
  app: NestExpressApplication,
  logger: AppLogger,
) {
  const viewsPath = join(dirname, "..", "src/views");
  app.set("views", viewsPath);
  // app.useStaticAssets(join(__dirname, '..', 'public'), {
  //   prefix: '/public',
  // });
  // logger.debug(`static asstes: ${join(__dirname, '..', 'public')}`);

  // Configura Nunjucks
  nunjucks.configure(viewsPath, {
    autoescape: true,
    express: app.getHttpAdapter().getInstance(),
    watch: true,
  });

  logger.debug(`VIEW: ${viewsPath}`);
  app.setBaseViewsDir(viewsPath);
  app.setViewEngine("njk");
}
