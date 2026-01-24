import {
  AccessResponse,
  AppLogger,
  Contact,
  CreateContactFromImportDto,
  CreateTeamForTenantDto,
  DikeConfigService,
  EnvNotFoundException,
  IBulkResponse,
  ILoginResult,
  ImportType,
  inspect,
  IRegisterResult,
  KeycloakUserDto,
  LoginUserDto,
  Mapping,
  Membership,
  Office,
  OfficeDto,
  OnboardingPages,
  OriginDto,
  Plan,
  PlanKeys,
  Profile,
  SendMailDto,
  SendVerificationLinkDto,
  Subscription,
  SubscriptionResponse,
  Team,
  Tenant,
  VerifyEmailTokenDto,
} from "@dike/common";
import { FindOrCreateProfileResponse } from "@dike/contracts";
import { HttpService } from "@nestjs/axios";
import {
  HttpStatus,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { BaseHttpService } from "./communication.service";
import { IKeycloakUser } from "./keycloak/keycloak-user.interface";
import { SaveEmailVerificationTokenDto } from "./profile/save-email-verification-token.dto";
import { LoggedUser } from "./user/logged-user";

@Injectable({ scope: Scope.REQUEST })
export class ApiGatewayService extends BaseHttpService {
  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService
  ) {
    super(
      httpService,
      new AppLogger(ApiGatewayService.name),
      configService,
      configService.env("API_GATEWAY_BASE_URL", "http://localhost:3000/api")
    );
  }

  public get baseUrl(): string {
    return this.serviceParams.baseUrl();
  }

  async findUserByEmailForVerification(
    originDto: OriginDto,
    email: string
  ): Promise<IKeycloakUser> {
    const queryParams: URLSearchParams = new URLSearchParams();
    queryParams.append("email", email);
    const queryStr = `?${queryParams.toString()}`;

    const url = `/v1/users${queryStr}`;
    const res = await this.get(url, originDto);
    return res.data;
  }

  /**
   * Effettua il logout propagando la richiesta al backend
   */
  async logoutUser(loggedUser: LoggedUser): Promise<ILoginResult> {
    const url = "/v1/auth/logout";
    await loggedUser.initialize();
    const res = await this.post(
      `${this.baseUrl}${url}`,
      { token: loggedUser.token.accessToken },
      loggedUser.token.originDto
    );
    return res.data;
  }

  /**
   *
   * @param {OriginDto} originDto - The origin information including IP and User-Agent
   * @param {LoginUserDto} payload - The login credentials including email, password, and username
   * @param {string} [payload.email] - The email of the user attempting to log in
   * @param {string} [payload.username] - Optional username of the user
   * @param {string} payload.password - The password of the user
   * @returns {AccessResponse}
   */
  async loginUser(
    originDto: OriginDto,
    payload: LoginUserDto
  ): Promise<AccessResponse> {
    if (!payload.email && !payload.username) {
      throw new Error("Either email or username must be provided for login");
    }

    const url = "/v1/auth/login";
    const res = await this.post(url, payload, originDto);
    // this.logger.log(`[AuthService.login]: ${inspect(res)}`);
    return res.data;
  }

  async registerUser(
    originDto: OriginDto,
    registerData: KeycloakUserDto
  ): Promise<IRegisterResult> {
    const url = "/v1/auth/register";
    const response = await this.post(url, registerData, originDto);
    this.logger.debug(`User created successfully: ${inspect(response)}`);
    if (!response || typeof response !== "object" || !("email" in response)) {
      const { email } = registerData;
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        registrationStatus: "failed",
        message: "Risposta non valida dal backend",
        id: undefined,
        email,
      };
    }
    return response.data as IRegisterResult;
  }

  async saveEmailVerificationToken(
    originDto: OriginDto,
    { userId, verificationToken }: SaveEmailVerificationTokenDto
  ): Promise<void> {
    const url = `/v1/profiles/${userId}/email-verification`;
    await this.post(url, { verificationToken }, originDto);
  }

  async sendEmail(
    originDto: OriginDto,
    { to, subject, body }: SendMailDto
  ): Promise<void> {
    const url = `/v1/email/send`;
    await this.post(url, { to, subject, body }, originDto);
  }

  async sendVerificationMail(
    loggedUser: LoggedUser,
    { to, link }: SendVerificationLinkDto
  ): Promise<Date> {
    const url = `/v1/email/verification`;
    const response = await this.post(url, { to, link }, loggedUser.token.originDto);
    return response.data;
  }

  async verifyEmailToken(
    originDto: OriginDto,
    { to, verificationLink }: VerifyEmailTokenDto
  ): Promise<{ message: string }> {
    const queryParams: URLSearchParams = new URLSearchParams();
    queryParams.append("email", encodeURIComponent(to));
    queryParams.append("token", encodeURIComponent(verificationLink));
    let queryStr = `?${queryParams.toString()}`;

    const url = `/v1/auth/verify-email${queryStr}`;
    const res = await this.get(url, originDto);
    return res.data;
  }

  /**
   * Crea un team e invia gli inviti ai membri
   */
  async createTeamForTenant(
    loggedUser: LoggedUser,
    tenantId: string,
    { teamName, inviteEmails }: CreateTeamForTenantDto
  ): Promise<any> {
    const url = `/v1/tenants/${tenantId}/teams`;
    const response = await this.post(
      url,
      { teamName, inviteEmails },
      loggedUser.token.originDto
    );

    return response.data;
  }

  async findOrCreateProfile(
    loggedUser: LoggedUser,
    userId?: string
  ): Promise<FindOrCreateProfileResponse> {
    // await loggedUser.initialize();
    const url = `/v1/profiles/find-or-create`;
    const response = await this.post(
      url,
      { userId: userId ?? loggedUser.id },
      loggedUser.token.originDto
    );
    return response.data;
  }

  async findOrCreateUserProfileByToken(
    loggedUser: LoggedUser
  ): Promise<FindOrCreateProfileResponse> {
    const url = `/v1/profiles/find-or-create`;

    const response = await this.post(
      url,
      { userId: loggedUser.id },
      loggedUser.token.originDto
    );
    return response.data;
  }

  async findTenantsByOwner(
    loggedUser: LoggedUser,
    ownerId: string
  ): Promise<Tenant[]> {
    const queryParams: URLSearchParams = new URLSearchParams();
    queryParams.append("ownerId", ownerId);
    const queryStr = `?${queryParams.toString()}`;

    const url = `/v1/tenant${queryStr}`;
    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  async findOrCreateTenantForOwner(
    loggedUser: LoggedUser,
    ownerId: string
  ): Promise<[Tenant, boolean]> {
    const url = "/v1/tenants/find-or-create";
    const res = await this.post(url, { ownerId }, loggedUser.token.originDto);
    return res.data;
  }

  async findOrCreateOfficeOnTenant(
    loggedUser: LoggedUser,
    officeDto: OfficeDto,
    tenantId?: string
  ): Promise<Office> {
    const url = `/v1/tenants/${tenantId ?? loggedUser.tenantId}/office/find-or-create`;
    const res = await this.post(url, officeDto, loggedUser.token.originDto);
    return res.data;
  }

  async findOfficesByTenantId(
    loggedUser: LoggedUser,
    officeData: Partial<Office>,
    tenantId: string
  ): Promise<Office[]> {
    const queryParams: URLSearchParams = new URLSearchParams();
    queryParams.append("tenantId", tenantId);
    const queryStr = `?${queryParams.toString()}`;

    const url = `/v1/office${queryStr}`;
    const res = await this.get(url, loggedUser.token.originDto);
    return res.data;
  }

  async findTenantById(
    loggedUser: LoggedUser,
    tenantId?: string
  ): Promise<Tenant | null> {
    const url = `/v1/tenants/${tenantId ?? loggedUser.tenantId}`;
    const res = await this.get(url, loggedUser.token.originDto);
    return res.data;
  }

  async getTenantsByOwner(
    loggedUser: LoggedUser,
    userId: string
  ): Promise<Tenant[]> {
    const url = `/v1/tenants/by-owner/${userId}`;
    const res = await this.get(url, loggedUser.token.originDto);
    return res.data;
  }

  async subscribe(
    loggedUser: LoggedUser,
    planKey: PlanKeys,
    tenantId?: string
  ): Promise<void> {
    let tenant: Tenant | null;
    if (!tenantId) {
      [tenant] = await this.findOrCreateTenantForOwner(
        loggedUser,
        loggedUser.id // IFXME: is it mandatory?
      );
      tenantId = tenant.id;
    } else {
      tenant = await this.findTenantById(loggedUser, tenantId);
    }
    const url = `/v1/subscriptions/${tenantId}/${planKey}`;
    const response = await this.post(url, {}, loggedUser.token.originDto); // FIXME: fill this values
    return response.data;
    // Implement the logic to update the user's plan here.
    // For now, this is a stub.
    // Example: await this.httpService.post('/api/user/plan', data);
  }

  async getOnboardingForUser(
    originDto: OriginDto,
    userId: string
  ): Promise<number> {
    const url = `/v1/onboarding/${userId}`;
    const response = await this.get(url, originDto);
    this.logger.log(
      `Onboarding current step for user ${userId}: ${response.data}`
    );
    return response.data;
  }

  async getOnboardingNextStep(loggedUser: LoggedUser): Promise<number> {
    const url = `/v1/onboarding/next`;
    const userId = loggedUser.id;
    const [profile, created] = await this.findOrCreateProfile(
      loggedUser,
      userId
    );
    if (!profile || profile === null) {
      throw new NotFoundException("User profile not found");
    }
    this.logger.debug(`Onboarding next step for user ${userId}: ${profile}`);
    const response = profile.lastCompletedOnBoardingStep;
    if (!response || response === null) {
      return 1;
    }
    return response;
  }

  async updateProfile(
    loggedUser: LoggedUser,
    profileData: Partial<Profile>
  ): Promise<Profile> {
    if (!loggedUser.token.accessToken) {
      this.logger.error("Token is required to update profile");
      throw new EnvNotFoundException("Token is required to update profile");
    }
    const userId = profileData.userId || loggedUser.id;
    if (!userId) {
      this.logger.error("Invalid token: userId not found");
      throw new EnvNotFoundException("Invalid token: userId not found");
    }
    let url = `/v1/profiles/${userId}`;
    const response = await this.patch(
      url,
      profileData,
      loggedUser.token.originDto
    );
    return response.data;
  }

  async updateProfileByUserId(
    loggedUser: LoggedUser,
    userId: string,
    profileData: Partial<Profile>
  ): Promise<Profile> {
    const url = `/v1/profiles/${userId}`;
    const response = await this.patch(
      url,
      profileData,
      loggedUser.token.originDto
    );
    return response.data;
  }

  async addOffice(
    loggedUser: LoggedUser,
    ownerId: string,
    name: string
  ): Promise<Office> {
    const defultTenantId = await this.getDefaultTenantIdByOwnerId(
      loggedUser,
      ownerId
    );
    // const tenant = await this.getTenantById(tokenDto, defultTenantId);
    const url = `/v1/tenants/${defultTenantId}/office`;
    const response = await this.post(url, { name }, loggedUser.token.originDto);
    return response.data;
  }

  async addTeam(
    loggedUser: LoggedUser,
    ownerId: string,
    name: string
  ): Promise<Team> {
    const defultTenantId = await this.getDefaultTenantIdByOwnerId(
      loggedUser,
      ownerId
    );
    // const tenant = await this.getTenantsByOwner(tokenDto, ownerId);
    const url = `/v1/tenants/${defultTenantId}/team`;
    const response = await this.post(url, { name }, loggedUser.token.originDto);
    return response.data;
  }

  async subscribePlan(
    loggedUser: LoggedUser,
    planName: string
  ): Promise<Subscription> {
    const defultTenantId = await this.getDefaultTenantIdByOwnerId(loggedUser);
    const url = `/v1/subscription/${defultTenantId}/${planName}`;
    const data = { planName };
    const response = await this.post(url, data, loggedUser.token.originDto);
    return response.data;
  }

  async isFeatureEnabled(
    loggedUser: LoggedUser,
    tenantId: string,
    featureName: string
  ): Promise<boolean> {
    const queryParams: URLSearchParams = new URLSearchParams();
    queryParams.append("name", featureName);
    let queryStr = `?${queryParams.toString()}`;

    const url = `/v1/subscription/${tenantId}/features${queryStr}`;
    const response = await this.get(url, loggedUser.token.originDto);
    return response.data.enabled;
  }

  async subscribePlanOnTenant(
    loggedUser: LoggedUser,
    tenantId: string,
    planKey: string
  ): Promise<Subscription> {
    const url = `/v1/tenants/${tenantId}/subscriptions`;
    const response = await this.post(
      url,
      { planKey },
      loggedUser.token.originDto
    );
    return response.data;
  }

  async updateOnboardingStep(
    loggedUser: LoggedUser,
    step: number
  ): Promise<void> {
    const url = `/v1/onboarding`;
    const data = { step };
    await this.post(url, data, loggedUser.token.originDto);
    this.logger.log(
      `Onboarding step updated to ${step} for user ${loggedUser.id}`
    );
  }

  async updateLastCompletedOnboardingStep(
    loggedUser: LoggedUser,
    step: number
  ): Promise<string> {
    const userId = loggedUser.id;
    const url = `/v1/profiles/${userId}`;
    const data = {
      lastCompletedOnBoardingStep: step,
    };
    await this.patch(
      url,
      step < OnboardingPages.STEP_MAX
        ? data
        : { ...data, defaultRedirectUrl: "/dashboard" },
      loggedUser.token.originDto
    );

    const queryParams = new URLSearchParams();
    queryParams.append("page", String(step + 1));
    const queryStr = `?${queryParams.toString()}`;

    return `/onboarding/user${queryStr}`;
  }

  async getPlans(loggedUser: LoggedUser): Promise<Plan[]> {
    const url = `/v1/plans`;
    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  async getDefaultTenantIdByOwnerId(
    loggedUser: LoggedUser,
    userId?: string
  ): Promise<string> {
    const [profile, created] = await this.findOrCreateProfile(
      loggedUser,
      userId ?? loggedUser.id
    );
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }
    const response = profile.tenantId;
    if (!response) {
      throw new NotFoundException("Default tenant ID not found in profile");
    }
    return response;
  }

  async sendVerificationEmail(
    loggedUser: LoggedUser,
    to: string,
    link: string
  ): Promise<Date> {
    const url = `/v1/notification/email/verification`;
    const response = await this.post(
      url,
      { to, link },
      loggedUser.token.originDto
    );
    return response.data;
  }

  async getProfileByUserId(
    loggedUser: LoggedUser,
    userId: string
  ): Promise<Profile | null> {
    const url = `/v1/profiles/${userId}`;
    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  async getSubscriptionByTenant(
    loggedUser: LoggedUser,
    tenantId: string
  ): Promise<SubscriptionResponse> {
    const requestUrl = `/v1/subscriptions/tenant/${tenantId}`;
    const response = await this.get(requestUrl, loggedUser.token.originDto);
    return response.data;
  }

  async subscribePlanForTenant(
    loggedUser: LoggedUser,
    { tenantId, planKey }: { tenantId: string; planKey: PlanKeys }
  ): Promise<Subscription> {
    const requestUrl = `/v1/tenants/${tenantId}/subscriptions`;
    const response = await this.post(
      requestUrl,
      { planKey },
      loggedUser.token.originDto
    );
    return response.data;
  }

  async getActivePlanByKey(
    loggedUser: LoggedUser,
    planKey: PlanKeys
  ): Promise<Plan | null> {
    const url = `/v1/plans/${planKey}`;

    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  async createOfficeForTenant(
    loggedUser: LoggedUser,
    tenantId: string,
    name: string,
    address?: string,
    piva?: string
  ): Promise<Office> {
    const url = `/v1/tenants/${tenantId}/offices`;
    const response = await this.post(
      url,
      { name, tenantId, address, piva },
      loggedUser.token.originDto
    );
    return response.data;
  }

  async getProfileSettings(loggedUser: LoggedUser): Promise<any> {
    const url = `/v1/profiles/settings`;
    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  async updateProfileSettings(
    loggedUser: LoggedUser,
    settingsData: any
  ): Promise<any> {
    const url = `/v1/profiles/settings`;
    const response = await this.patch(
      url,
      settingsData,
      loggedUser.token.originDto
    );
    return response.data;
  }

  async updateProfileVisibilitySettings(
    loggedUser: LoggedUser,
    settingsData: any
  ): Promise<any> {
    const url = `/v1/profiles/settings/visibility`;
    const response = await this.patch(
      url,
      settingsData,
      loggedUser.token.originDto
    );
    return response.data;
  }

  async findTenantForUserId(
    loggedUser: LoggedUser,
    userId: string
  ): Promise<Tenant[]> {
    const queryParams: URLSearchParams = new URLSearchParams();
    queryParams.append("ownerId", userId);
    const queryStr = `?${queryParams.toString()}`;

    const url = `/v1/tenants/member/${queryStr}`;

    const response = await this.get(url, loggedUser.token.originDto);

    return response.data;
  }

  async findOrCreateMembershipBetweenTenantAndUser(
    loggedUser: LoggedUser,
    tenantId: string,
    membershipData: { userId: string; role: string }
  ): Promise<any> {
    const url = `/v1/tenants/${tenantId}/memberships/find-or-create`;
    const response = await this.post(
      url,
      membershipData,
      loggedUser.token.originDto
    );
    return response.data;
  }

  async refreshToken(
    loggedUser: LoggedUser,
    userId: string
  ): Promise<ILoginResult> {
    const url = `/v1/auth/refresh-token`;
    const data = {
      userId,
    };
    const res = await this.post(url, data, loggedUser.token.originDto);
    return res.data;
  }

  async getTenantById(
    loggedUser: LoggedUser,
    tenantId: string
  ): Promise<Tenant> {
    const url = `/v1/tenants/${tenantId}`;
    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  async getMembershipsByUserId(
    loggedUser: LoggedUser,
    userId?: string
  ): Promise<Membership[]> {
    const url = `/v1/memberships/${userId || loggedUser.id}`;

    const response = await this.get(url, loggedUser.token.originDto);

    return response.data;
  }

  async findOrCreateMapping(
    loggedUser: LoggedUser,
    mappingData: Partial<Mapping>
  ): Promise<[Mapping, boolean]> {
    const requestUrl = `/v1/mappings/find-or-create`;

    const response = await this.post(
      requestUrl,
      mappingData,
      loggedUser.token.originDto
    );
    return response.data;
  }

  async findOrCreateContactMapping(
    loggedUser: LoggedUser,
    mappingData: Partial<Mapping>
  ): Promise<[Mapping, boolean]> {
    return this.findOrCreateMapping(loggedUser, {
      entityType: ImportType.CONTACT,
      ...mappingData,
    });
  }

  async updateMapping(
    loggedUser: LoggedUser,
    headerHash: string,
    mappingData: Partial<Mapping>
  ): Promise<any> {
    const url = `/v1/mappings/${headerHash}`;
    const response = await this.put(
      url,
      mappingData,
      loggedUser.token.originDto
    );
    return response.data;
  }

  /**
   * Find mapping by header hash.
   * @param {LoggedUser} loggedUser - The logged-in user performing the operation
   * @param {string} headerHash - The hash of the header to find the mapping for
   * @returns {Promise<Mapping | null>} - The found Mapping object or null if not found
   */
  async findMappingsByHash(
    loggedUser: LoggedUser,
    headerHash: string
  ): Promise<Mapping | null> {
    const url = `/v1/mappings/${headerHash}`;
    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  /**
   * Update contact mapping for a specific header hash.
   * @param {LoggedUser} loggedUser - The logged-in user performing the operation
   * @param {string} headerHash - The hash of the header for which to update the contact mapping
   * @param {Partial<Mapping>} mappingData - The new contact mapping data to be applied
   * @returns {Promise<any>} - The result of the update operation
   */
  async updateContactMapping(
    loggedUser: LoggedUser,
    headerHash: string,
    mappingData: Partial<Mapping>
  ): Promise<any> {
    return this.updateMapping(loggedUser, headerHash, {
      entityType: ImportType.CONTACT,
      ...mappingData,
    });
  }

  /**
   * Import contacts using the provided data.
   * @param {LoggedUser} loggedUser - The logged-in user performing the operation
   * @param {{ items: CreateContactFromImportDto[] }} body - The contacts to be imported
   * @returns {Promise<IBulkResponse<CreateContactFromImportDto>>} - The result of the import operation
   */
  async importContactsRaw(
    loggedUser: LoggedUser,
    body: { items: CreateContactFromImportDto[] }
  ): Promise<IBulkResponse<CreateContactFromImportDto>> {
    const url = `/v1/contacts/bulk`;
    const response = await this.post(url, body, loggedUser.token.originDto);
    return response.data;
  }

  /**
   * Update mapping rules for a specific header hash.
   * @param {LoggedUser} loggedUser - The logged-in user performing the operation
   * @param {string} headerHash - The hash of the header for which to update the mapping rules
   * @param {Record<string, any>} rules - The new mapping rules to be applied
   * @returns {Promise<Mapping>} - The updated Mapping object
   */
  async updateMappingRules(
    loggedUser: LoggedUser,
    headerHash: string,
    rules: Record<string, any>
  ): Promise<Mapping> {
    const url = `/v1/mappings/${headerHash}/rules`;
    const response = await this.patch(url, rules, loggedUser.token.originDto);
    return response.data;
  }

  async getMappingRulesByHash(
    loggedUser: LoggedUser,
    headerHash: string
  ): Promise<Record<string, any>> {
    const requestUrl = `/v1/mappings/${headerHash}/rules`;
    const response = await this.get(requestUrl, loggedUser.token.originDto);
    return response.data;
  }

  /**
   * Import contacts in chunks.
   * @param {LoggedUser} loggedUser - The logged-in user performing the operation
   * @param {CreateContactFromImportDto[]} chunk - The chunk of contacts to be created
   * @returns {Promise<IBulkResponse<CreateContactFromImportDto>>} - The result of the chunk creation operation
   */
  async bulkCreateContacts(
    loggedUser: LoggedUser,
    chunk: CreateContactFromImportDto[]
  ): Promise<IBulkResponse<CreateContactFromImportDto>> {
    const url = `/v1/contacts/bulk`;
    const response = await this.post(
      url,
      { data: chunk },
      loggedUser.token.originDto
    );
    return response.data;
  }

  // async bulkImportContacts(
  //   loggedUser: LoggedUser,
  //   chunk: Record<string, any>[]
  // ): Promise<IBulkResponse<CreateContactFromImportDto>> {
  //   const url = `/v1/contacts/bulk`;
  //   const response = await this.post(
  //     url,
  //     { data: chunk },
  //     loggedUser.token.originDto
  //   );
  //   return response.data;
  // }

  // /**
  //  * Import contacts using a file upload.
  //  * @param {LoggedUser} loggedUser - The logged-in user performing the operation
  //  * @param {FormData} formData - The form data containing the contacts to be imported
  //  * @param {Buffer} formData.file - The file containing the contacts to be imported
  //  * @param {string} formData.headerHash - The hash of the header for the import
  //  * @param {ImportType} formData.type - The type of import (e.g., CONTACT)
  //  * @returns {Promise<IBulkResponse<CreateContactFromImportDto>>} - The result of the import operation
  //  */
  // async importsContacts(
  //   loggedUser: LoggedUser,
  //   // formData: FormData,
  //   file: any,
  //   headerHash: string,
  //   type: ImportType = ImportType.CONTACT,
  // ): Promise<IBulkResponse<CreateContactFromImportDto>> {
  //   const requestUrl = '/v1/imports/contacts';
  //   const response = await this.post(
  //     requestUrl,
  //     // formData,
  //     { file, headerHash, type },
  //     loggedUser.token.originDto,
  //     { 'Content-Type': 'multipart/form-data' },
  //   );
  //   return response.data;
  // }

  async getContactCount(loggedUser: LoggedUser): Promise<number> {
    const url = `/v1/contacts/count`;
    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  async getInvoiceCount(loggedUser: LoggedUser): Promise<number> {
    return Promise.resolve(0);
    const url = `/v1/invoices/count`;
    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  async getMattersCount(loggedUser: LoggedUser): Promise<number> {
    return Promise.resolve(0);
    const url = `/v1/matters/count`;
    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  async getDocumentsCount(loggedUser: LoggedUser): Promise<number> {
    return Promise.resolve(0);
    const url = `/v1/documents/count`;
    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  async getContacts(
    loggedUser: LoggedUser,
    assignedTo?: string,
    createdBy?: string,
    search?: string,
    page?: number,
    limit?: number
  ): Promise<Contact[]> {
    const queryParams = new URLSearchParams();
    if (assignedTo) queryParams.append("assignedTo", assignedTo);
    if (createdBy) queryParams.append("createdBy", createdBy);
    if (search) queryParams.append("search", search);
    if (page) queryParams.append("page", page.toString());
    if (limit) queryParams.append("limit", limit.toString());
    let queryStr = "";
    if (queryParams.toString() !== "") {
      queryStr = `?${queryParams.toString()}`;
    }
    const url = `/v1/contacts${queryStr}`;
    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  /**
   * Upgrage the subscription to a specified plan.
   *
   * @param {LoggedUser} loggedUser - The logged-in user performing the operation
   * @param {PlanKeys} planKey - The key of the plan to upgrade to
   * @returns {Promise<Subscription>} - The updated subscription after upgrade
   */
  async upgradeSubscription(
    loggedUser: LoggedUser,
    planKey: PlanKeys
  ): Promise<Subscription> {
    const url = `/v1/subscriptions/upgrade`;
    const response = await this.patch(
      url,
      { planKey },
      loggedUser.token.originDto
    );
    return response.data;
  }

  /**
   * Downgrade the subscription to a specified plan.
   *
   * @param {LoggedUser} loggedUser - The logged-in user performing the operation
   * @param {PlanKeys} planKey - The key of the plan to downgrade to
   * @returns {Promise<Subscription>} - The updated subscription after downgrade
   */
  async downgradeSubscription(
    loggedUser: LoggedUser,
    planKey: PlanKeys
  ): Promise<Subscription> {
    const url = `/v1/subscriptions/downgrade`;
    const response = await this.patch(
      url,
      { planKey },
      loggedUser.token.originDto
    );
    return response.data;
  }

  /**
   * Admin login to the system.
   *
   * @param {OriginDto} originDto - The origin data transfer object
   * @param {LoginUserDto} body - The login user data transfer object containing email, password, and username
   * @param {string} body.email - The email of the admin user
   * @param {string} body.password - The password of the admin user
   * @param {string} body.username - The username of the admin user
   * @returns {Promise<ILoginResult>} - The result of the admin login operation
   */
  async loginAdmin(
    originDto: OriginDto,
    body: LoginUserDto
  ): Promise<ILoginResult> {
    const url = `/v1/admin/auth/login`;
    const response = await this.post(url, body, originDto);
    return response.data;
  }

  async internalExchangeToken(
    originDto: OriginDto,
    keycloakToken: string
  ): Promise<ILoginResult> {
    const url = `/v1/auth/internal/exchange-token`;
    const response = await this.post(url, keycloakToken, originDto);
    return response.data;
  }
}
