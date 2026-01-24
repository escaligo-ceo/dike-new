import { AppLogger, EnvNotFoundException, Office, Token } from "@dike/common";
import { ApiGatewayService, LoggedUser } from "@dike/communication";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class OfficeService {
  constructor(
    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,
    private readonly logger: AppLogger,
    private readonly apiGatewayService: ApiGatewayService
  ) {
    this.logger = new AppLogger(OfficeService.name);
  }

  async findByTenantId(loggedUser: LoggedUser, tenantId: string): Promise<Office[]> {
    return this.officeRepository.find({ where: { tenantId } });
  }

  async findOrCreateByTenantId(
    loggedUser: LoggedUser,
    tenantId: string,
    officeData: Partial<Office>
  ): Promise<[Office, boolean]> {
    const officeId = officeData.id;
    const offices: Office[] = await this.findByTenantId(loggedUser, tenantId);
    if (offices.length === 0) {
      const entity = {
        ...officeData,
        tenantId,
      };
      const office: Office | null = await this.officeRepository.save(entity);
      return [office, true];
    }
    return [offices[0], false];
  }

  async findOrCreate(
    loggedUser: LoggedUser,
    officeData: Partial<Office>
  ): Promise<[Office, boolean]> {
    const tenantId = officeData.tenantId;
    if (!tenantId) {
      throw new Error(
        "tenantId is required to find or create an Office"
      );
    }
    const offices: Office[] = await this.findByTenantId(loggedUser, tenantId);
    if (offices.length === 0) {
      const entity = {
        ...officeData,
        tenantId,
      };
      const office: Office | null = await this.officeRepository.save(entity);
      return [office, true];
    }
    return [offices[0], false];
  }
}
