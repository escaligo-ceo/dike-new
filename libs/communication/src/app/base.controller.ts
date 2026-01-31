import { DikeConfigService, AppLogger } from "@dike/common";
import { UserFactory } from "../user/user-factory";

export class BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory
  ) {
    this.logger = !logger ? new AppLogger(BaseController.name) : logger;
  }

  get appUrl(): string {
    return this.configService.env("WWW_URL");
  }

  protected logRequest(req: Request, message: string): void {
    this.logger.debug(`${req.method} ${this.appUrl}${req.url}\n\t${message}`);
  }
}
