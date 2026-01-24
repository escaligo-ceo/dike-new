import { AppLogger, DikeConfigService } from "@dike/common";
import { ApiGatewayService, BaseHttpService } from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { CsvMapper, CsvMapping } from "./csv/csv.mapper";

@Injectable()
export class ContactImportService extends BaseHttpService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly serviceUrl: string,

    private readonly csvMapper: CsvMapper,
    private readonly apiGatewayService: ApiGatewayService
  ) {
    super(
      httpService,
      new AppLogger(ContactImportService.name),
      configService,
      configService.env("IMPORT_SERVICE_URL", "http://localhost:8007/api")
    );
  }

  async importCsv(rows: any[], mapping: CsvMapping, tenantId: string) {
    const contactsToCreate = this.csvMapper.mapCsv(rows, mapping);

    // for (const contact of contactsToCreate) {
    //   await this.apiGatewayService.importContacts({
    //     ...contact,
    //     tenantId,
    //   });
    // }
  }
}
