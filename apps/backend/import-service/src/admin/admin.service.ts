import { AppLogger } from '@dike/common';
import { ApiGatewayService, BaseAdminService } from '@dike/communication';
import { Injectable } from "@nestjs/common";

@Injectable()
export class AdminService extends BaseAdminService {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly apiGatewayService: ApiGatewayService,
  ) {
    super(
      new AppLogger(AdminService.name),
      apiGatewayService
    );
  }
}
