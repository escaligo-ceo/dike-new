import {
  AppLogger,
  BaseUrl,
  Contact,
  ContactAutocompleteDto,
  CreateContactFromImportDto,
  DikeConfigService,
  generateHeadersHash,
  IBulkResponse,
  IFindContactsFilters,
  ImportType,
  inspect,
  Mapping,
  OriginDto,
} from "@dike/common";
import { AuditService, BaseHttpService, LoggedUser } from "@dike/communication";
import { ContactDto } from "@dike/contracts";
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
      new AppLogger(HttpContactService.name),
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

  // async sendVerificationEmail(
  //   origin: OriginDto,
  //   email: string,
  //   link: string
  // ): Promise<void> {
  //   const payload = {
  //     to: email,
  //     link,
  //   };

  //   const response = await this.post(
  //     "/v1/email/verification",
  //     payload,
  //     origin,
  //   );
  //   return response.data;
  // }

  // async sendTeamInviteEmail(origin: OriginDto, invite: Invite): Promise<void> {
  //   const payload = {
  //     to: invite.email,
  //     // teamName: invite.teamName,
  //     link: invite.link(this.frontendBaseUrl),
  //   };

  //   const response = await this.post(
  //     "/v1/email/team-invite",
  //     payload,
  //     origin,
  //   );
  //   return response.data;
  // }

  // async sendAlreadyRegisteredEmail(
  //   origin: OriginDto,
  //   email: string
  // ): Promise<void> {
  //   const payload = {
  //     to: email,
  //     ...origin,
  //   };

  //   await this.post("/v1/email/already-registered", payload, origin);
  // }

  // async findOrCreateMappings(
  //   loggedUser: LoggedUser,
  //   externalIds: string[],
  //   sourceType: string,
  //   mapping: Record<string, string>,
  //   defaults?: Record<string, string>
  // ): Promise<[Mapping, boolean]> {
  //   const requestUrl = `/v1/mappings/find-or-create`;
  //   try {
  //     const response = await this.post(
  //       requestUrl,
  //       {
  //         externalIds,
  //         sourceType,
  //         mapping,
  //         defaults,
  //       },
  //       tokenDto.toOriginDto()
  //     );
  //     return response.data;
  //   } catch (error) {
  //     this.logger.error("Failed to find or create mappings", error);
  //     if (axios.isAxiosError(error) && error.response) {
  //       throw new HttpException(error.response.data, error.response.status);
  //     }

  //     throw new InternalServerErrorException("Errore interno");
  //   }
  // }

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
    const recalculatedHeaderHash = await generateHeadersHash(headerNormalized);
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
  }

  async bulkCreateContacts(
    loggedUser: LoggedUser,
    body: { items: CreateContactFromImportDto[] }
  ): Promise<IBulkResponse<CreateContactFromImportDto>> {
    const url = `/v1/contacts/bulk`;
    const response = await this.post(url, body, loggedUser.token.originDto);
    return response.data;
  }

  async getContactsCount(loggedUser: LoggedUser): Promise<{ count: number }> {
    this.logger.debug(`Fetching contacts count`);
    const url = `/v1/contacts/count`;
    const response = await this.get(url, loggedUser.token.originDto);
    this.logger.log(`Contacts count response data: ${inspect(response.data)}`);
    return response.data;
  }

  async getContacts(
    loggedUser: LoggedUser,
    queryParams: IFindContactsFilters
  ): Promise<{ items: Contact[]; total: number; page: number; limit: number }> {
    const queryString = new URLSearchParams();
    if (queryParams.assignedTo) {
      queryString.append("assignedTo", queryParams.assignedTo);
    }
    if (queryParams.createdBy) {
      queryString.append("createdBy", queryParams.createdBy);
    }
    if (queryParams.search) {
      queryString.append("search", queryParams.search);
    }
    if (queryParams.page !== undefined) {
      queryString.append("page", queryParams.page.toString());
    }
    if (queryParams.limit !== undefined) {
      queryString.append("limit", queryParams.limit.toString());
    }
    let queryStr = "";
    if (Array.from(queryString).length > 0) {
      queryStr = `?${queryString.toString()}`;
    }
    const url = `/v1/contacts${queryStr}`;
    const response = await this.get(url, loggedUser.token.originDto);

    // Enrich contacts with preferred email
    const contacts: Contact[] = response.data.items || response.data;
    const enrichedContacts = contacts.map(
      (contact) =>
        ({
          ...contact,
          preferredEmail: contact.preferredEmail,
        }) as Contact
    );

    return {
      items: enrichedContacts,
      total: response.data.total || contacts.length,
      page: response.data.page || queryParams.page || 1,
      limit: response.data.limit || queryParams.limit || 25,
    };
  }

  async getTrashedContacts(
    loggedUser: LoggedUser,
    filters: IFindContactsFilters
  ): Promise<{ items: Contact[]; total: number; page: number; limit: number }> {
    const queryString = new URLSearchParams();
    if (filters.assignedTo) {
      queryString.append("assignedTo", filters.assignedTo);
    }
    if (filters.createdBy) {
      queryString.append("createdBy", filters.createdBy);
    }
    if (filters.search) {
      queryString.append("search", filters.search);
    }
    if (filters.page !== undefined) {
      queryString.append("page", filters.page.toString());
    }
    if (filters.limit !== undefined) {
      queryString.append("limit", filters.limit.toString());
    }
    if (filters.deleted !== undefined) {
      this.logger.debug(`Overwrite deleted filter: ${filters.deleted}`);
      queryString.append("deleted", "true");
    }

    let queryStr = "";
    if (Array.from(queryString).length > 0) {
      queryStr = `?${queryString.toString()}`;
    }
    const url = `/v1/contacts/trash${queryStr}`;
    const response = await this.get(url, loggedUser.token.originDto);

    // Enrich contacts with preferred email
    const contacts: Contact[] = response.data.items || response.data;
    const enrichedContacts = contacts.map(
      (contact) =>
        ({
          ...contact,
          preferredEmail: contact.preferredEmail,
        }) as Contact
    );

    return {
      items: enrichedContacts,
      total: response.data.total || contacts.length,
      page: response.data.page || filters.page || 1,
      limit: response.data.limit || filters.limit || 25,
    };
  }

  async getContactById(
    loggedUser: LoggedUser,
    contactId: string
  ): Promise<Contact | null> {
    const url = `/v1/contacts/${contactId}`;

    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  async updateContact(
    loggedUser: LoggedUser,
    contactId: string,
    contactData: ContactDto
  ): Promise<Contact> {
    const url = `/v1/contacts/${contactId}`;
    const response = await this.put(
      url,
      contactData,
      loggedUser.token.originDto
    );
    return response.data;
  }

  async patchContact(
    loggedUser: LoggedUser,
    contactId: string,
    contactDto: ContactDto
  ): Promise<Contact> {
    const url = `/v1/contacts/${contactId}`;

    const response = await this.patch(
      url,
      contactDto,
      loggedUser.token.originDto
    );

    return response.data;
  }

  async deleteContact(
    loggedUser: LoggedUser,
    contactId: string
  ): Promise<Contact> {
    const url = `/v1/contacts/${contactId}`;

    const readonly = await this.delete(url, loggedUser.token.originDto);
    return readonly.data;
  }

  async restoreContact(
    loggedUser: LoggedUser,
    contactId: string
  ): Promise<Contact> {
    const url = `/v1/contacts/${contactId}/restore`;

    const response = await this.post(url, {}, loggedUser.token.originDto);
    return response.data;
  }

  /**
   * Retrieve contacts matching the search query for autocomplete purposes
   * @param {LoggedUser} loggedUser - the user performing the operation
   * @param {string} searchQuery - the search query string
   * @param {number|undefined} limit - optional limit of results. Defaults to 6 if not provided
   * @returns {Promise<ContactAutocompleteDto[]>} - a promise that resolves to an array of contact autocomplete DTOs
   */
  async autocompleteContacts(
    loggedUser: LoggedUser,
    searchQuery: string,
    limit?: number
  ): Promise<ContactAutocompleteDto[]> {
    const queryString = new URLSearchParams();
    queryString.append("query", searchQuery);
    if (limit !== undefined) {
      queryString.append("limit", limit.toString());
    }
    const queryStr = `?${queryString.toString()}`;
    const url = `/v1/contacts/autocomplete${queryStr}`;

    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  /**
   * Retrieve the avatar of a contact as a base64-encoded string
   * @param {LoggedUser} loggedUser - the user performing the operation
   * @param {string} contactId - the ID of the contact
   * @param {IFindContactsFilters} filters - options for finding the contact
   * @param {boolean} [filters.deleted] - whether to include deleted contacts
   * @returns {Promise<string>} - a promise that resolves to the contact avatar as a base64-encoded string
   */
  async getContactAvatar(
    loggedUser: LoggedUser,
    contactId: string,
    filters: IFindContactsFilters
  ): Promise<string> {
    const queryString = new URLSearchParams();
    if (filters.deleted !== undefined) {
      queryString.append("deleted", filters.deleted ? "true" : "false");
    }
    let queryStr = "";
    if (Array.from(queryString).length > 0) {
      queryStr = `?${queryString.toString()}`;
    }
    const url = `/v1/contacts/${contactId}/avatar${queryStr}`;

    const response = await this.get(url, loggedUser.token.originDto);
    const svgString = response.data;

    return (
      "data:image/svg+xml;base64," + Buffer.from(svgString).toString("base64")
    );
  }

  /**
   * Retrieve the URL of a contact's avatar
   * @param {LoggedUser} loggedUser - the user performing the operation
   * @param {string} contactId - the ID of the contact
   * @param {IFindContactsFilters} filters - options for finding the contact
   * @param {boolean} [filters.deleted] - whether to include deleted contacts
   * @returns {Promise<string>} - a promise that resolves to the contact avatar URL
   */
  async getContactAvatarUrl(
    loggedUser: LoggedUser,
    contactId: string,
    filters: IFindContactsFilters
  ): Promise<string | undefined> {
    const queryString = new URLSearchParams();
    if (filters.deleted !== undefined) {
      queryString.append("deleted", filters.deleted ? "true" : "false");
    }
    let queryStr = "";
    if (Array.from(queryString).length > 0) {
      queryStr = `?${queryString.toString()}`;
    }
    const url = `/v1/contacts/${contactId}/avatar-url${queryStr}`;

    const response = await this.get(url, loggedUser.token.originDto);
    return response.data;
  }

  async createContact(
    loggedUser: LoggedUser,
    ContactDto: ContactDto
  ): Promise<Contact> {
    const url = `/v1/contacts`;
    const response = await this.post(
      url,
      ContactDto,
      loggedUser.token.originDto
    );
    return response.data;
  }

  async deleteContactFromTrash(
    loggedUser: LoggedUser,
    contactId: string
  ): Promise<void> {
    const url = `/v1/contacts/trash/${contactId}`;

    await this.delete(url, loggedUser.token.originDto);
  }
}
