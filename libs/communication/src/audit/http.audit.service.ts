import { AppLogger, DikeConfigService, OriginDto } from "@dike/common";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ApiBody, ApiOperation } from "@nestjs/swagger";
import { BaseHttpService } from "../communication.service";
import { LoggedUser } from "../user/logged-user";
import { LogDto } from "./log.dto";
import { AuditAction } from "./audit.enum";

@Injectable()
export class HttpAuditService extends BaseHttpService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
  ) {
    super(
      httpService,
      new AppLogger(HttpAuditService.name),
      configService,
      configService.env("AUDIT_SERVICE_URL", "http://localhost:8001/api"),
    );
  }

  /**
   * Logs an event by sending a POST request to the `/v1/log` endpoint.
   *
   * @param {OriginDto} originDto - The origin information for the log entry (e.g., user, service, or system that triggered the event).
   * @param {AuditAction} action - The action performed (string, required).
   * @param {string} message - The message describing the event (string, required).
   * @param {any} data - Additional information about the event (object or string, optional).
   * @returns {Promise<void>} A promise that resolves when the log entry has been sent.
   *
   * @remarks
   * This method uses the `post` function to send the log data along with origin details
   * to the backend service for auditing purposes.
   */
  @ApiOperation({ summary: "Write audit log" })
  @ApiBody({
    type: LogDto,
    description:
      "Log data to be recorded. Must include all required fields as per LogDto definition.",
    examples: {
      example1: {
        summary: "User Login Event",
        value: {
          action: "LOGIN",
          entity: "User",
          entityId: "12345",
          timestamp: new Date().toISOString(),
          details: { ipAddress: "192.168.1.1" },
        },
      },
    },
  })
  async log(
    loggedUser: LoggedUser,
    action: AuditAction,
    message: string,
    data?: any,
  ): Promise<void> {
    const url = "/v1/log";
    const dto: LogDto = {
      action,
      message,
      data,
    };
    await this.post(url, dto, loggedUser.token.originDto);
  }

  async logRegistration(
    originDto: OriginDto,
    message: string,
    data?: any,
  ): Promise<void> {
    const url = "/v1/log";
    const dto: LogDto = {
      action: AuditAction.REGISTER_USER_SUCCESS,
      message,
      data,
    };
    await this.post(url, dto, originDto);
  }
}
