import {
  AppLogger,
  BaseUrl,
  CreateContactFromImportDto,
  DikeConfigService,
  generateHeadersHash,
  IBulkResponse,
  ImportType,
  inspect,
  Invite,
  Mapping,
  OriginDto,
} from "@dike/common";
import { AuditService, BaseHttpService, LoggedUser } from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import axios from "axios";

@Injectable()
export class HttpContactService extends BaseHttpService {
  private readonly frontendServiceParams: BaseUrl;

  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly auditService: AuditService
  ) {
    super(
      httpService,
      logger,
      configService,
      configService.env("CONTACT_SERVICE_URL", "http://localhost:8006/api")
    );
    const frontendServiceUrl = this.configService.env(
      "FRONTEND_URL",
      "http://localhost:5172"
    );
    this.frontendServiceParams = new BaseUrl(frontendServiceUrl);
  }

  public get frontendBaseUrl(): string {
    return this.frontendServiceParams.baseUrl();
  }

  /**
   * Sends a verification email.
   * @param {OriginDto} origin - origin information
   * @param {string} email - email address
   * @param {string} link - verification link
   * @returns {Promise<void>}
   */
  async sendVerificationEmail(
    origin: OriginDto,
    email: string,
    link: string
  ): Promise<void> {
    const payload = {
      to: email,
      link,
    };

    const response = await this.post("/v1/email/verification", payload, origin);
    return response.data;
  }

  /**
   * Sends a team invitation email.
   * @param {OriginDto} origin - origin information
   * @param {Invite} invite - invite details
   * @returns {Promise<void>}
   */
  async sendTeamInviteEmail(origin: OriginDto, invite: Invite): Promise<void> {
    const payload = {
      to: invite.email,
      // teamName: invite.teamName,
      link: invite.link(this.frontendBaseUrl),
    };

    const response = await this.post("/v1/email/team-invite", payload, origin);
    return response.data;
  }

  /**
   * Sends an "already registered" email notification.
   * @param {OriginDto} origin - origin information
   * @param {string} email - email address
   * @returns {Promise<void>}
   */
  async sendAlreadyRegisteredEmail(
    origin: OriginDto,
    email: string
  ): Promise<void> {
    const payload = {
      to: email,
      ...origin,
    };

    await this.post("/v1/email/already-registered", payload, origin);
  }

  /**
   * Retrieves a mapping by its headers hash.
   * @param {OriginDto} origin - origin information
   * @param {string} headerHash - hash of the headers
   * @returns {Promise<Mapping | null>} - the mapping if found, otherwise null
   */
  async findMappingsByHash(
    origin: OriginDto,
    headerHash: string
  ): Promise<Mapping | null> {
    const requestUrl = `/v1/mappings/${headerHash}`;
    try {
      const response = await this.get(requestUrl, origin);
      return response.data;
    } catch (error) {
      this.logger.error("Failed to find mapping by hash", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }

      throw new InternalServerErrorException("Errore interno");
    }
  }

  /**
   * Retrieves or creates a mapping based on headers hash.
   * @param {LoggedUser} loggedUser - user performing the operation
   * @param {ImportType} sourceType - type of the import source
   * @param {string[]} headers - original headers
   * @param {string[]} headerNormalized - normalized headers
   * @param {string} headerHash - hash of the headers
   * @param {string} headerHashAlgorithm - algorithm used for hashing
   * @returns {Promise<[Mapping, boolean]>} - the mapping and a boolean indicating if it was created
   */
  async findOrCreateMapping(
    loggedUser: LoggedUser,
    sourceType: ImportType,
    headers: string[],
    headerNormalized: string[],
    headerHash: string,
    headerHashAlgorithm: string
  ): Promise<[Mapping, boolean]> {
    this.logger.log(
      `findOrCreateMapping called with headers: ${inspect(
        headers
      )}, headerNormalized: ${inspect(headerNormalized)}`
    );
    const requestUrl = `/v1/mappings/find-or-create`;
    try {
      const recalculatedHeaderHash =
        await generateHeadersHash(headerNormalized);
      if (recalculatedHeaderHash !== headerHash) {
        this.logger.warn(
          `Header hash mismatch: provided ${headerHash}, recalculated ${recalculatedHeaderHash}`
        );
        throw new BadRequestException(
          "Header hash does not match the provided headers"
        );
      }

      const response = await this.post(
        requestUrl,
        {
          sourceType,
          headers,
          headerNormalized,
          headerHash,
          headerHashAlgorithm,
        },
        loggedUser.token.originDto
      );
      return response.data;
    } catch (error) {
      this.logger.error("Failed to find or create mapping", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }

      throw new InternalServerErrorException("Errore interno");
    }
  }

  /**
   * Import contacts via HTTP to the Contact Service.
   * @param {LoggedUser} loggedUser - user performing the import
   * @param {CreateContactFromImportDto[]} items - import details
   * @returns {Promise<IBulkResponse<CreateContactFromImportDtoContact>>} - result of the import
   */
  async importContacts(
    loggedUser: LoggedUser,
    items: CreateContactFromImportDto[]
  ): Promise<IBulkResponse<CreateContactFromImportDto>> {
    const url = `/v1/contacts/import`;
    const response = await this.post(
      url,
      { items },
      loggedUser.token.originDto
    );
    return response.data;
  }

  /**
   * Import contacts in bulk via HTTP to the Contact Service.
   * @param {LoggedUser} loggedUser - user performing the bulk creation
   * @param {CreateContactFromImportDto[]} contacts - contacts to create in bulk
   * @returns {Promise<IBulkResponse<CreateContactFromImportDto>>} Result of bulk contact creation
   */
  async bulkCreateContacts(
    loggedUser: LoggedUser,
    contacts: CreateContactFromImportDto[]
  ): Promise<IBulkResponse<CreateContactFromImportDto>> {
    const url = `/v1/contacts/bulk`;
    const response = await this.post(
      url,
      { items: contacts },
      loggedUser.token.originDto
    );
    return response.data;
  }
}
