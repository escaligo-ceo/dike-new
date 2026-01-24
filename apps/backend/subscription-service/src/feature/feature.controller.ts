import { AppLogger, DikeConfigService } from '@dike/common';
import { BaseController, JwtAuthGuard, UserFactory } from '@dike/communication';
import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@Controller('feature')
@ApiTags('feature')
export class FeatureController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory
  ) {
    super(new AppLogger(FeatureController.name), configService, userFactory);
  }
}
