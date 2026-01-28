import {
  AccessResponse,
  Analytics,
  AppLogger,
  CurrentUser,
  DikeConfigService,
  IOnboardingResponse,
} from "@dike/common";
import {
  Audit,
  AuditAction,
  AuditCategory,
  BaseController,
  JwtAuthGuard,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { OnboardingService } from "./onboarding.service";

@Controller("onboarding")
@ApiTags("Onboarding")
@UseGuards(JwtAuthGuard)
export class OnboardingController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
    private readonly onboardingService: OnboardingService,
  ) {
    super(new AppLogger(OnboardingController.name), configService, userFactory);
  }

  @Post("start")
  @Version("1")
  @Audit(AuditCategory.PROCESS, AuditAction.ONBOARDING_START)
  startOnboarding(@CurrentUser() loggedUser: LoggedUser, @Req() req) {
    this.logRequest(req, "startOnboarding");
    return this.onboardingService.startOnboarding(loggedUser);
  }

  @Post("step")
  @Version("1")
  @Audit(AuditCategory.PROCESS, AuditAction.ONBOARDING_STEP)
  stepOnboarding(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() body: any,
    @Req() req,
  ): Promise<AccessResponse> {
    this.logRequest(req, "stepOnboarding");
    return this.onboardingService.stepOnboarding(loggedUser, body);
  }

  @Post("complete")
  @Version("1")
  @Audit(AuditCategory.PROCESS, AuditAction.ONBOARDING_COMPLETE)
  completeOnboarding(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ): Promise<AccessResponse> {
    this.logRequest(req, "completeOnboarding");
    return this.onboardingService.completeOnboarding(loggedUser);
  }

  @Get()
  @Version("1")
  @Analytics()
  getOnboardingByUserId(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ): Promise<IOnboardingResponse> {
    this.logRequest(req, "getOnboardingByUserId");
    return this.onboardingService.findByUserId(loggedUser);
  }
}
