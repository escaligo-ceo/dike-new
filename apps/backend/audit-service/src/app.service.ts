import { AppLogger, DikeConfigService, IPingResponse } from "@dike/common";
import { Header, Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  constructor(
    private readonly logger: AppLogger,
    protected readonly configService: DikeConfigService
  ) {
    this.logger = new AppLogger(AppService.name);
  }

  private get copyrightPeriod(): string {
    const currentYear = new Date().getFullYear();
    return currentYear > 2025 ? `2025-${currentYear}` : "2025";
  }

  @Header("Content-Type", "application/json")
  ping(): IPingResponse {
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      name: this.configService.env("APP_NAME", "audit-service"),
      version: this.configService.env("VERSION", "0.0.1"),
      copyright: `Copyright © ${this.copyrightPeriod} Escaligo s.r.l.`,
      services: {
        email: "ready",
        sms: "not_implemented",
        push: "not_implemented",
      },
    };
  }
}
