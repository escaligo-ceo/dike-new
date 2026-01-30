import {
  AppLogger,
  DikeConfigService,
  IAuthenticatedRequest,
  inspect,
  JobRole,
  Office,
  OfficeDto,
  PlanKeys,
  PostOnboardingDto,
  Profile,
  Tenant,
} from "@dike/common";
import {
  ApiGatewayService,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Response } from "express";

@Injectable()
export class OnboardingService {
  private readonly appUrl: string | undefined;

  constructor(
    private readonly logger: AppLogger,
    private readonly apiGatewayService: ApiGatewayService,
    protected readonly configService: DikeConfigService,
    private readonly userFactory: UserFactory
  ) {
    this.logger = new AppLogger(OnboardingService.name);
    this.appUrl = this.configService.env("APP_URL");
  }

  csrfToken(req: IAuthenticatedRequest): string {
    const res = req.csrfToken ? req.csrfToken() : undefined;
    if (!res) throw new Error("CSRF token not found");
    return res;
  }

  private async updateDefaultRedirectUrl(
    loggedUser: LoggedUser,
    currentPage: number
  ): Promise<string> {
    const defaultRedirectUrl =
      await this.apiGatewayService.updateLastCompletedOnboardingStep(
        loggedUser,
        currentPage
      );

    // Always use relative paths to avoid cross-origin cookie issues
    const res = currentPage < 7 ? `${defaultRedirectUrl}` : "/dashboard";
    return res;
  }

  async goToNextStep(loggedUser: LoggedUser): Promise<number> {
    const nextStep =
      await this.apiGatewayService.getOnboardingNextStep(loggedUser);
    await this.apiGatewayService.updateOnboardingStep(loggedUser, nextStep);
    return nextStep;
  }

  async getNextStep(
    loggedUser: LoggedUser,
    currentStep: number
  ): Promise<number> {
    const expectedStep =
      await this.apiGatewayService.getOnboardingNextStep(loggedUser);
    if (expectedStep !== currentStep) {
      const userId = loggedUser.id;
      throw new NotFoundException(
        `Onboarding step ${currentStep} not found for user ${userId}!\nexpected: ${expectedStep}`
      );
    }
    return expectedStep + 1;
  }

  getCompleteProfile(
    req,
    res: Response,
    loggedUser: LoggedUser
  ): void {
    const currentPage = 1;
    const jobRoles = Object.entries(JobRole).reduce((acc, [key, label]) => {
      acc[key] = label;
      return acc;
    }, {});
    this.logger.debug(
      `Rendering onboarding page ${currentPage} with job roles: ${inspect(jobRoles)}`
    );

    const queryParams: URLSearchParams = new URLSearchParams();
    queryParams.append("page", String(currentPage));
    const queryStr = `?${queryParams.toString()}`;

    res.render(`onboarding/user/complete-profile`, {
      currentPage,
      jobRoles,
      token: loggedUser.getToken(),
      csrfToken: this.csrfToken(req),
      title: "Benvenuto in Dike! Raccontaci di più su di te.",
      user: req.decodedKeycloakToken,
      actionUrl: `/onboarding/user${queryStr}`,
    });
  }

  async postCompleteProfile(
    loggedUser: LoggedUser,
    body: any,
    res: Response
  ): Promise<void> {
    const currentPage = 1;

    const { _csrf, ...profileData } = body;
    await this.apiGatewayService.updateProfile(loggedUser, {
      ...profileData,
      userId: loggedUser.id,
    });
    this.logger.log(`onboarding Step ${currentPage} completed`);

    const defaultRedirectUrl = await this.updateDefaultRedirectUrl(
      loggedUser,
      currentPage
    );

    res.redirect(defaultRedirectUrl);
  }

  getWhatUserLike(
    req,
    res: Response,
    loggedUser: LoggedUser
  ): void {
    const currentPage = 2;

    const queryParams: URLSearchParams = new URLSearchParams();
    queryParams.append("page", String(currentPage));
    const queryStr = `?${queryParams.toString()}`;

    res.render("onboarding/user/page2", {
      currentPage,
      csrfToken: this.csrfToken(req),
      title: "Benvenuto in Dike! Per cosa userai Dike?",
      user: req.decodedKeycloakToken,
      actionUrl: `/onboarding/user${queryStr}`,
    });
  }

  async postWhatUserLike(
    loggedUser: LoggedUser,
    { body }: PostOnboardingDto,
    res: Response
  ): Promise<void> {
    const currentPage = 2;

    this.logger.log(`onboarding Step ${currentPage} completed`);

    const defaultRedirectUrl = await this.updateDefaultRedirectUrl(
      loggedUser,
      currentPage
    );

    res.redirect(defaultRedirectUrl);
  }

  async getSubscribePlan(
    req,
    res: Response,
    loggedUser: LoggedUser
  ): Promise<void> {
    const currentPage = 3;
    const userId = loggedUser.id;
    this.logger.debug(
      `Rendering onboarding page ${currentPage} for user ID: ${userId}`
    );
    const plans = await this.apiGatewayService.getPlans(loggedUser);
    const queryParams: URLSearchParams = new URLSearchParams();
    queryParams.append("page", String(currentPage));
    const queryStr = `?${queryParams.toString()}`;

    res.render("onboarding/user/subscribe-plan", {
      currentPage,
      plans,
      csrfToken: this.csrfToken(req),
      title:
        "Stai usando il piano Gratuito! Aggiornalo per soddisfare le tue esigenze di professionista",
      user: req.decodedKeycloakToken,
      actionUrl: `/onboarding/user${queryStr}`,
    });
    return;
  }

  async postSubscribePlan(
    loggedUser: LoggedUser,
    body: { planKey: string },
    res: Response
  ): Promise<void> {
    const currentPage = 3;

    const [tenant]: [Tenant, boolean] =
      await this.apiGatewayService.findOrCreateTenantForOwner(
        loggedUser,
        loggedUser.id
      );
    this.logger.log(`Created tenant for onboarding: ${inspect(tenant)}`);

    this.logger.debug(`User selected plan: ${inspect(body)}`);
    const subscription = await this.apiGatewayService.subscribePlanOnTenant(
      loggedUser,
      tenant.id,
      body.planKey ?? PlanKeys.FREE
    );
    this.logger.debug(
      `Created subscription for onboarding: ${inspect(subscription)}`
    );

    const [membership, created] =
      await this.apiGatewayService.findOrCreateMembershipBetweenTenantAndUser(
        loggedUser,
        tenant.id,
        {
          userId: loggedUser.id,
          role: "OWNER",
        }
      );
    this.logger.debug(
      `Created membership for onboarding: ${inspect(membership)}`
    );

    await this.apiGatewayService.updateProfileByUserId(
      loggedUser,
      loggedUser.id,
      {
        tenantId: tenant.id,
        lastCompletedOnBoardingStep: currentPage,
      }
    );

    // // refresh token keycloak custom claims
    // await this.apiGatewayService.refreshToken(loggedUser, loggedUser.id);

    this.logger.log(`onboarding Step ${currentPage} completed`);

    const defaultRedirectUrl = await this.updateDefaultRedirectUrl(
      loggedUser,
      currentPage
    );

    res.redirect(defaultRedirectUrl);
  }

  async getOffice(
    req,
    res: Response,
    loggedUser: LoggedUser
  ): Promise<void> {
    const currentPage = 4;

    const queryParams: URLSearchParams = new URLSearchParams();
    queryParams.append("page", String(currentPage));
    const queryStr = `?${queryParams.toString()}`;

    res.render("onboarding/user/office", {
      currentPage,
      csrfToken: this.csrfToken(req),
      title: "Benvenuto in Dike! Descrivi i tuoi uffici.",
      user: req.decodedKeycloakToken,
      actionUrl: `/onboarding/user${queryStr}`,
    });
  }

  async postOffice(
    loggedUser: LoggedUser,
    officeDto: OfficeDto,
    res: Response
  ): Promise<void> {
    const currentPage = 4;
    const profile: Profile = await loggedUser.getProfile();
    const tenant: Tenant = await this.apiGatewayService.getTenantById(
      loggedUser,
      profile.tenantId! // FIXME: chek this value
    );

    const office: Office =
      await this.apiGatewayService.findOrCreateOfficeOnTenant(
        loggedUser,
        officeDto,
        tenant.id
      );

    const defaultRedirectUrl = await this.updateDefaultRedirectUrl(
      loggedUser,
      currentPage
    );
    this.logger.log(`onboarding Step ${currentPage} completed`);
    res.redirect(defaultRedirectUrl);
  }

  async getTeam(
    req,
    res: Response,
    loggedUser: LoggedUser
  ): Promise<void> {
    const currentPage = 5;

    const queryParams: URLSearchParams = new URLSearchParams();
    queryParams.append("page", String(currentPage));
    const queryStr = `?${queryParams.toString()}`;

    res.render("onboarding/user/team", {
      currentPage,
      csrfToken: this.csrfToken(req),
      title:
        "Benvenuto in Dike! Invita i tuoi collaboratori ad unirsi al tuo studio.",
      user: req.decodedKeycloakToken,
      actionUrl: `/onboarding/user${queryStr}`,
    });
  }

  async postTeam(
    loggedUser: LoggedUser,
    body: any,
    res: Response
  ): Promise<void> {
    // // const team = await this.apiGatewayService.addTeam(tokenDto, body); // FIXME: implementare AddTeam method

    // const userId = userIdFromToken(tokenDto.token);
    // this.logger.log(
    //   `onboarding Step ${currentPage} for user ID: ${userId} with data: ${inspect(body)}`
    // );
    // await this.apiGatewayService.updateProfile(tokenDto, {
    //   onboardingStep: 5,
    //   ...body,
    // });
    // this.logger.log(`onboarding Step ${currentPage} completed`);
    // const nextStep = await this.goToNextStep(tokenDto);
    // const queryParams: URLSearchParams = new URLSearchParams();
    // queryParams.append("page", String(nextStep));
    // // queryParams.append("token", token);
    // const queryStr = `?${queryParams.toString()}`;
    // res.redirect(`/onboarding/user${queryStr}`);
    // // return team;
    // return new Team(); // FIXME: return created team

    const currentPage = 5;
    // FIXME: save what user likes!

    // const userId = userIdFromToken(tokenDto.token);
    // const { _csrf, ...profileData } = body;
    // await this.apiGatewayService.updateProfile(tokenDto, {
    //   ...profileData,
    //   userId,
    // });
    this.logger.log(`onboarding Step ${currentPage} completed`);

    const defaultRedirectUrl = await this.updateDefaultRedirectUrl(
      loggedUser,
      currentPage
    );

    res.redirect(defaultRedirectUrl);
  }

  async getStep6(
    req,
    res: Response,
    loggedUser: LoggedUser
  ): Promise<void> {
    const currentPage = 6;

    const queryParams: URLSearchParams = new URLSearchParams();
    queryParams.append("page", String(currentPage));
    const queryStr = `?${queryParams.toString()}`;

    res.render("onboarding/user/page6", {
      currentPage,
      csrfToken: this.csrfToken(req),
      title: `Benvenuto in Dike! Step ${currentPage}.`,
      user: req.decodedKeycloakToken,
      actionUrl: `/onboarding/user${queryStr}`,
    });
  }

  async postStep6(
    loggedUser: LoggedUser,
    body: any,
    res: Response
  ): Promise<void> {
    // const userId = userIdFromToken(tokenDto.token);
    // this.logger.log(
    //   `onboarding Step 6 for user ID: ${userId} with data: ${inspect(body)}`
    // );
    // await this.apiGatewayService.updateProfile(tokenDto, {
    //   onboardingStep: 6,
    //   ...body,
    // });
    // this.logger.log("onboarding Step 6 completed");
    // const nextStep = await this.goToNextStep(tokenDto);
    // const queryParams: URLSearchParams = new URLSearchParams();
    // queryParams.append("page", String(nextStep));
    // // queryParams.append("token", token);
    // const queryStr = `?${queryParams.toString()}`;
    // res.redirect(`/onboarding/user${queryStr}`);

    const currentPage = 6;
    // FIXME: save what user likes!

    // const userId = userIdFromToken(tokenDto.token);
    // const { _csrf, ...profileData } = body;
    // await this.apiGatewayService.updateProfile(tokenDto, {
    //   ...profileData,
    //   userId,
    // });
    this.logger.log(`onboarding Step ${currentPage} completed`);

    const defaultRedirectUrl = await this.updateDefaultRedirectUrl(
      loggedUser,
      currentPage
    );

    res.redirect(defaultRedirectUrl);
  }

  async getStep7(
    req,
    res: Response,
    loggedUser: LoggedUser
  ): Promise<void> {
    const currentPage = 7;

    const queryParams: URLSearchParams = new URLSearchParams();
    queryParams.append("page", String(currentPage));
    const queryStr = `?${queryParams.toString()}`;

    res.render("onboarding/user/finish", {
      currentPage,
      csrfToken: this.csrfToken(req),
      // title: 'One last step, invite yor team',
      title: "Un'ultimo passo, invita il tuo team.",
      user: req.decodedKeycloakToken,
      actionUrl: `/onboarding/user${queryStr}`,
    });
  }

  async postStep7(
    loggedUser: LoggedUser,
    body: any,
    res: Response
  ): Promise<void> {
    const currentPage = 7;
    const { teamName, teamEmail } = body;
    this.logger.log(`onboarding Step ${currentPage} completed`);
    if (teamEmail.length === 0) {
      this.logger.log("No team emails provided, skipping team creation.");
      this.logger.log("onboarding COMPLETED");
      const defaultRedirectUrl = await this.updateDefaultRedirectUrl(
        loggedUser,
        currentPage
      );
      res.redirect(defaultRedirectUrl);
      return;
    }

    const [tenant, created]: [Tenant, boolean] =
      await this.apiGatewayService.findOrCreateTenantForOwner(
        loggedUser,
        loggedUser.id
      );
    this.logger.debug(`Created tenant for onboarding: ${inspect(tenant)}`);

    // Invia i dati al backend (adatta qui la chiamata se serve)
    await this.apiGatewayService.createTeamForTenant(loggedUser, tenant.id, {
      teamName,
      inviteEmails: Array.isArray(teamEmail)
        ? teamEmail
        : teamEmail
          ? [teamEmail]
          : [],
    });
    this.logger.log("onboarding COMPLETED");
    const defaultRedirectUrl = await this.updateDefaultRedirectUrl(
      loggedUser,
      currentPage
    );
    res.redirect(defaultRedirectUrl);
  }
}
