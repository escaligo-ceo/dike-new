import { AppLogger, inspect, OriginDto } from "@dike/common";
import { AuditLog, LogDto, LoggedUser } from "@dike/communication";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

/**
 * Service for handling audit logs
 * Anche gli utenti non autenticati possono generare log (es. errori di login),
 * quindi non mettiamo qui il JwtAuthGuard
 */
@Injectable()
export class LogService {
  constructor(
    @InjectRepository(AuditLog)
    public auditEventRepository: Repository<AuditLog>,
    private readonly logger: AppLogger
  ) {
    this.logger = new AppLogger(LogService.name);
  }

  /**
   * Write an audit log event
   * @param {originDto} originDto - The origin information of the action
   * @param {LogDto} param1 - The log data
   * @param {string} param1.action - The action type
   * @param {string} param1.message - The log message
   * @param {any} param1.data - Additional data
   * @returns {Promise<void>} - A promise that resolves when the log is written
   */
  async writeLog(
    originDto: OriginDto,
    { action, message, data }: LogDto
  ): Promise<void> {
    const entity = {
      eventDate: new Date(), // La data evento viene sempre impostata dal backend per imparzialità
      eventType: action,
      performedBy: originDto.originIp || "system",
      // context: { system: 'system' },
      source: {
        userAgent: originDto.originUserAgent || "system",
        ip: originDto.originIp || "system",
      },
      data,
      message,
    };
    // this.logger.log(`Creating audit log entry: ${inspect(entity)}`);
    await this.auditEventRepository.save(entity);
    this.logger.log(`Audit log written: ${inspect(entity)}`);
    return;
  }
}
