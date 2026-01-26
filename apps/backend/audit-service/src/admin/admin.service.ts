import { AppLogger } from "@dike/common";
import { ApiGatewayService, AuditLog, AuditStatsDto, BaseAdminService, LoggedUser, UserFactory } from "@dike/communication";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class AdminService extends BaseAdminService {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly apiGatewayService: ApiGatewayService,
    @InjectRepository(AuditLog)
    public auditEventRepository: Repository<AuditLog>,
  ) {
    super(
      new AppLogger(AdminService.name),
      apiGatewayService
    );
  }

  private getTotalEventsCount(): Promise<number> {
    return this.auditEventRepository.count();
  }

  private async getUniqueUsersCount(): Promise<number> {
    const result = await this.auditEventRepository
      .createQueryBuilder("audit_log")
      .select("COUNT(DISTINCT(audit_log.performedBy))", "count")
      .getRawOne();
    return parseInt(result.count, 10);
  }

  private async getLastEventDate(): Promise<string | null> {
    const result = await this.auditEventRepository
      .createQueryBuilder("audit_log")
      .select("MAX(audit_log.eventDate)", "lastEventAt")
      .getRawOne();
    return result.lastEventAt ? new Date(result.lastEventAt).toISOString() : null;
  }
  
  async getStats(loggedUser: LoggedUser): Promise<AuditStatsDto> {
    // Qui puoi implementare la logica per raccogliere le statistiche reali
    // Esempio placeholder:
    return {
      totalEvents: await this.getTotalEventsCount(),
      uniqueUsers: await this.getUniqueUsersCount(),
      lastEventAt: await this.getLastEventDate(),
      // ...altre statistiche
    };
  }
}
