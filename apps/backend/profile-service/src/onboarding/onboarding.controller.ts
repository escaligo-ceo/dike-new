import {
  Analytics,
  AppLogger,
  CurrentUser,
  DikeConfigService,
  OnboardingPages,
} from "@dike/common";
import {
  BaseController,
  JwtAuthGuard,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { OnboardingService } from "./onboarding.service";

@ApiTags("onboarding")
@UseGuards(JwtAuthGuard)
@Controller("onboarding")
export class OnboardingController extends BaseController {
  constructor(
    private readonly onboardingService: OnboardingService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
  ) {
    super(new AppLogger(OnboardingController.name), configService, userFactory);
  }

  @Get()
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Ottieni stato onboarding utente" })
  getOnboardingStatus(
    @CurrentUser() loggedUser: LoggedUser,
    @Query("page") page: string,
    @Req() req,
  ) {
    this.logRequest(req, `'getOnboardingStatus`);
    const step = parseInt(page, 10);
    if (
      isNaN(step) ||
      step < OnboardingPages.START ||
      step > OnboardingPages.STEP_MAX
    ) {
      throw new Error("Invalid page number");
    }
    return this.onboardingService.getOnboardingStep(loggedUser, step);
  }

  @Get("next")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Ottieni il prossimo step di onboarding" })
  @ApiOkResponse({
    description: "Prossimo step di onboarding recuperato con successo",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Profilo utente non trovato",
  })
  async getNextOnboardingStep(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ) {
    this.logRequest(req, `getNextOnboardingStep`);
    return this.onboardingService.onBoardingNextStep(loggedUser);
  }
}
