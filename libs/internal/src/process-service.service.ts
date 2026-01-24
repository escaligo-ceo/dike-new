import { AppLogger, DikeConfigService, OriginDto, IOnboardingResponse } from "@dike/common";
import { HttpService } from "@nestjs/axios";
import { Injectable, Scope } from "@nestjs/common";
import { HttpProcessService } from "./communication/http.process.service.js";

@Injectable({ scope: Scope.REQUEST })
export class ProcessService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    private readonly httpProcessService: HttpProcessService,
  ) {
    this.logger = new AppLogger(ProcessService.name);
  }


  async getOnboardingForUser(
    originDto: OriginDto,
    userId: string
  ): Promise<IOnboardingResponse> {
    return this.httpProcessService.getOnboardingForUser(originDto, userId);
  }
}
