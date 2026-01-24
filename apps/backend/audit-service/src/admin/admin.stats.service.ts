import { AppLogger, DikeConfigService } from "@dike/common";
import { UserFactory } from "@dike/communication";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AdminStatsService {
  constructor(
    private readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
  ) {
    this.logger = new AppLogger(AdminStatsService.name);
  }
}