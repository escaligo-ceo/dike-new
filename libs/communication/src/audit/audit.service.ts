import { AppLogger, inspect, OriginDto } from "@dike/common";
import { Injectable } from "@nestjs/common";
import { LoggedUser } from "../user/logged-user";
import { HttpAuditService } from "./http.audit.service";
import { AuditAction } from "./audit.enum";

@Injectable()
export class AuditService {
  constructor(
    private readonly httpAuditService: HttpAuditService,
    private readonly logger: AppLogger,
  ) {
    this.logger = new AppLogger(AuditService.name);
  }

  async logRegistration(
    originDto: OriginDto,
    message: string,
    data: any = {},
  ): Promise<void> {
    return this.httpAuditService.logRegistration(originDto, message, data);
  }

  async safeLogRegistration(originDto: OriginDto, message: string, data?: any) {
    try {
      await this.logRegistration(originDto, message, data);
    } catch (err) {
      this.logger.error(`Audit log failed: ${inspect(err)}`);
    }
  }

  async log(
    loggedUser: LoggedUser,
    event: AuditAction,
    message: string,
    data: any = {},
  ): Promise<void> {
    return this.httpAuditService.log(loggedUser, event, message, data);
  }

  async safeLog(
    loggedUser: LoggedUser,
    event: AuditAction,
    message: string,
    data?: any,
  ) {
    try {
      await this.log(loggedUser, event, message, data);
    } catch (err) {
      this.logger.error(`Audit log failed: ${inspect(err)}`);
    }
  }
}
