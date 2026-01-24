import {
  AppLogger,
  AuthorizationBearer,
  extractTokenFromRequest,
  OnboardingPages,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import { JwtAuthGuard, LoggedUser, UserFactory } from "@dike/communication";
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
} from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Response } from "express";
import { OnboardingService } from "./onboarding.service";

@UseGuards(JwtAuthGuard)
@Controller("onboarding")
export class OnboardingController {
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly logger: AppLogger,
    private readonly userFactory: UserFactory
  ) {
    new AppLogger(OnboardingController.name);
  }

  @Get("user")
  @ApiOperation({
    summary: "Visualizza il passo della procedura di onboarding",
  })
  @ApiOkResponse({ description: "Passo di onboarding completato con successo" })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Passo di onboarding non completato",
  })
  async getOnboardingStep(
    @AuthorizationBearer() authorization: string,
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @Query("page") page: string,
    @Req() req,
    @Res() res: Response
  ) {
    const pageNumber = parseInt(page) || 1;
    const token = extractTokenFromRequest(req as any);
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    switch (pageNumber) {
      case OnboardingPages.STEP_1:
        this.onboardingService.getCompleteProfile(req, res, loggedUser);
        break;
      case OnboardingPages.STEP_2:
        this.onboardingService.getWhatUserLike(req, res, loggedUser);
        break;
      case OnboardingPages.STEP_3:
        await this.onboardingService.getSubscribePlan(req, res, loggedUser);
        break;
      case OnboardingPages.STEP_4:
        await this.onboardingService.getOffice(req, res, loggedUser);
        break;
      case OnboardingPages.STEP_5:
        await this.onboardingService.getTeam(req, res, loggedUser);
        break;
      case OnboardingPages.STEP_6:
        await this.onboardingService.getStep6(req, res, loggedUser);
        break;
      case OnboardingPages.STEP_7:
        await this.onboardingService.getStep7(req, res, loggedUser);
        break;
    }
  }

  @Post("user")
  @ApiOperation({
    summary:
      "Smista ai servizi incaricati i dati della procedura di onboarding",
  })
  @ApiOkResponse({
    description: "Dati del passo di onboarding gestiti con successo",
  })
  async postOnboardingPage(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Query("page") page: string,
    @Body() { _csrf, token: bodyToken, ...data }: any,
    @Res() res: Response,
    @Req() req
  ) {
    const pageNumber = parseInt(page);
    const loggedUser: LoggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );

    switch (pageNumber) {
      case OnboardingPages.STEP_1:
        await this.onboardingService.postCompleteProfile(loggedUser, data, res);
        break;
      case OnboardingPages.STEP_2:
        await this.onboardingService.postWhatUserLike(loggedUser, data, res);
        break;
      case OnboardingPages.STEP_3:
        await this.onboardingService.postSubscribePlan(loggedUser, data, res);
        break;
      case OnboardingPages.STEP_4:
        await this.onboardingService.postOffice(loggedUser, data, res);
        break;
      case OnboardingPages.STEP_5:
        await this.onboardingService.postTeam(loggedUser, data, res);
        break;
      case OnboardingPages.STEP_6:
        await this.onboardingService.postStep6(loggedUser, data, res);
        break;
      case OnboardingPages.STEP_7:
        await this.onboardingService.postStep7(loggedUser, data, res);
        break;
    }
  }
}
