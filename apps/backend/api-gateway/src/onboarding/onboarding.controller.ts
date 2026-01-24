import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  OnboardingPages,
  OriginIp,
  OriginUserAgent,
  userIdFromToken,
} from "@dike/common";
import { BaseController, JwtAuthGuard, UserFactory } from "@dike/communication";
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOperation } from "@nestjs/swagger";
import { OnboardingService } from "./onboarding.service";

@UseGuards(JwtAuthGuard)
@Controller("onboarding")
export class OnboardingController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    private readonly onboardingService: OnboardingService,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory
  ) {
    super(new AppLogger(OnboardingController.name), configService, userFactory);
  }

  @Get()
  @Version("1")
  @ApiOperation({ summary: "Ottieni lo step corrente di onboarding" })
  async getCurrentStep(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() headerToken: string,
    @Query("token") queryToken: string,
    @Req() req
  ) {
    this.logRequest(
      req,
      `getCurrentStep called with queryToken: ${queryToken}`
    );
    const loggerUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      headerToken
    );
    return this.onboardingService.getCurrentStep(loggerUser);
  }

  @Post()
  @Version("1")
  async postOnboardingPage(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Query("page") page: string,
    @Body() body: any,
    @Res() res,
    @Req() req
  ) {
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    this.logRequest(req, `postOnboardingPage called with page: ${page}`);
    const pageNumber = parseInt(page);
    this.logger.debug(`postOnboardingPage called with token: ${authorization}`);
    this.logger.debug(`postOnboardingPage called with originIp: ${originIp}`);
    this.logger.debug(
      `postOnboardingPage called with originUserAgent: ${originUserAgent}`
    );
    this.logger.debug(
      `postOnboardingPage called with body: ${JSON.stringify(body)}`
    );
    const userId = userIdFromToken(authorization);
    this.logger.debug(
      `[api-gateway.postOnboardingPage] postOnboardingPage called for user ${userId} on page ${pageNumber} with body: ${JSON.stringify(body)}`
    );
    // const expectedStep = await this.onboardingService.getNextStep({ token, step: pageNumber });

    this.logger.warn(
      `/!\\ postOnboardingPage tokenDto: ${JSON.stringify(loggedUser.token)}`
    );
    // const isStepAllowed = await this.onboardingService.isStepAllowed(
    //   tokenDto,
    //   pageNumber
    // );
    // if (!isStepAllowed) {
    //   this.logger.error(
    //     `User tried to post to step ${pageNumber} but it's not allowed`
    //   );
    //   res
    //     .status(HttpStatus.FORBIDDEN)
    //     .send("Accesso non autorizzato a questo passo di onboarding.");
    //   return;
    // }

    switch (pageNumber) {
      case OnboardingPages.STEP_1:
        await this.onboardingService.postCompleteProfile(loggedUser, body);
        break;
      case OnboardingPages.USER_CREATION:
        await this.onboardingService.postStep2(loggedUser, body);
        break;
      case OnboardingPages.PROFILE_CREATION:
        await this.onboardingService.postSubscribePlan(loggedUser, body);
        break;
      case OnboardingPages.TENANT_CREATION:
        await this.onboardingService.postOffice(loggedUser, body);
        break;
      case OnboardingPages.SUBSCRIPTION_SELECTION:
        await this.onboardingService.postTeam(loggedUser, body);
        break;
      case OnboardingPages.OFFICE_CREATION:
        await this.onboardingService.postStep6(loggedUser, body);
        break;
      case OnboardingPages.TEAM_CREATION:
        await this.onboardingService.postStep7(loggedUser, body);
        break;
      case OnboardingPages.SEND_INVITATIONS:
        await this.onboardingService.postStep7(loggedUser, body);
        break;
      default:
        this.logger.error(`Invalid onboarding step: ${pageNumber}`);
        res
          .status(HttpStatus.BAD_REQUEST)
          .send(`Invalid onboarding step: ${pageNumber}`);
        return;
    }
  }

  @Get("next")
  @Version("1")
  @ApiOperation({ summary: "Ottieni il prossimo step di onboarding" })
  async getNextStep(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authentication: string,
    @Req() req
  ) {
    this.logRequest(req, "getNextStep");
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authentication,
    );
    return this.onboardingService.getNextStep(loggedUser);
  }

  // @Get("allowed")
  // @Version("1")
  // @ApiOperation({ summary: "Controlla se lo step è consentito" })
  // async isStepAllowed(
  //   @OriginIp() originIp: string,
  //   @OriginUserAgent() originUserAgent: string,
  //   @AuthorizationBearer() authorization: string,
  //   @Query("page") step: number,
  //   @Query("token") queryToken: string
  // ) {
  //   const token = queryToken || authorization;
  //   const tokenDto: Token = new Token(originIp, originUserAgent, token);
  //   return this.onboardingService.isStepAllowed(tokenDto, step);
  // }
}
