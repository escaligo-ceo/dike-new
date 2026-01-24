import { IPingResponse } from "@dike/common";
import { Header, Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  @Header("Content-Type", "application/json")
  ping(): IPingResponse {
    const currentYear = new Date().getFullYear();
    const copyrightPeriod = currentYear > 2025 ? `2025-${currentYear}` : "2025";
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      name: process.env.APP_NAME || "auth-service",
      version: process.env.VERSION || "0.0.1",
      copyright: `Copyright © ${copyrightPeriod} Escaligo s.r.l.`,
      services: {
        email: "ready",
        sms: "not_implemented",
        push: "not_implemented",
      },
    };
  }
}
