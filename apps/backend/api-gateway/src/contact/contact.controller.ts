import {
  AppLogger,
  AuthorizationBearer,
  Contact,
  ContactAutocompleteDto,
  CreateContactFromImportDto,
  DikeConfigService,
  IBulkResponse,
  IFindContactsFilters,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import { BaseController, JwtAuthGuard, UserFactory } from "@dike/communication";
import { ContactDto } from "@dike/contracts";
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { HttpContactService } from "../communication/http.contact.service";

@UseGuards(JwtAuthGuard)
@Controller("contacts")
export class ContactController extends BaseController {
  constructor(
    private readonly httpContactService: HttpContactService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory
  ) {
    super(new AppLogger(ContactController.name), configService, userFactory);
  }

  @Post("bulk")
  @ApiOperation({ summary: "Import bulk contacts" })
  @Version("1")
  async bulkImportContacts(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Body() body: { items: CreateContactFromImportDto[] },
    @Req() req
  ): Promise<IBulkResponse<CreateContactFromImportDto>> {
    this.logRequest(req, `bulkImportContacts`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpContactService.bulkCreateContacts(loggedUser, body);
  }

  @Get("count")
  @ApiOperation({ summary: "Get contacts count for a tenant" })
  @ApiQuery({ name: "createdBy", required: false, type: String })
  @ApiQuery({ name: "assignedTo", required: false, type: String })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @Version("1")
  async getContactsCount(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req
  ): Promise<{ count: number }> {
    this.logRequest(req, `getContactsCount`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpContactService.getContactsCount(loggedUser);
  }

  @Get()
  @Version("1")
  @ApiQuery({ name: "createdBy", required: false, type: String })
  @ApiQuery({ name: "assignedTo", required: false, type: String })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiOperation({ summary: "Get all contacts for a tenant" })
  async getContacts(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req: any,
    @Query("createdBy") createdBy?: string,
    @Query("assignedTo") assignedTo?: string,
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ): Promise<{ items: Contact[]; total: number; page: number; limit: number }> {
    this.logRequest(req, `getContacts`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const queryParams: IFindContactsFilters = {
      assignedTo,
      createdBy,
      search,
      page,
      limit,
    };
    return this.httpContactService.getContacts(loggedUser, queryParams);
  }

  @Get("trash")
  @Version("1")
  @ApiOperation({ summary: "Get trashed contacts for a tenant" })
  @ApiQuery({ name: "createdBy", required: false, type: String })
  @ApiQuery({ name: "assignedTo", required: false, type: String })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getTrashedContacts(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req: any,
    @Query("createdBy") createdBy?: string,
    @Query("assignedTo") assignedTo?: string,
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ): Promise<{ items: Contact[]; total: number; page: number; limit: number }> {
    this.logRequest(req, `getTrashedContacts`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const filters: IFindContactsFilters = {
      assignedTo,
      createdBy,
      search,
      page,
      limit,
    };
    return this.httpContactService.getTrashedContacts(loggedUser, filters);
  }

  @Get("autocomplete")
  @Version("1")
  @ApiOperation({ summary: "Search contacts for autocomplete" })
  @ApiQuery({ name: "query", required: true, type: String })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: "List of contacts matching the search query",
    type: [ContactAutocompleteDto],
    headers: {
      "Content-Type": {
        description: "application/json",
      },
    },
  })
  async searchContacts(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req: any,
    @Query("query") query: string,
    @Query("limit") limit?: number
  ): Promise<ContactAutocompleteDto[]> {
    this.logRequest(req, `searchContacts with query: ${query}`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpContactService.autocompleteContacts(
      loggedUser,
      query,
      limit
    );
  }

  @Get(":contactId/avatar")
  @Version("1")
  @Header("Content-Type", "image/svg+xml")
  @ApiOperation({ summary: "Get contact avatar by ID" })
  @ApiResponse({
    status: 200,
    description: "SVG avatar",
    content: { "image/svg+xml": {} },
  })
  @ApiQuery({ name: "deleted", required: false, type: Boolean })
  async getContactAvatar(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req: any,
    @Param("contactId") contactId: string,
    @Query("deleted") deleted?: boolean
  ): Promise<any> {
    this.logRequest(req, `getContactAvatar with id: ${contactId}`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const filters: IFindContactsFilters = {};
    if (deleted !== undefined) {
      filters.deleted = deleted;
    }
    const avatar = await this.httpContactService.getContactAvatar(
      loggedUser,
      contactId,
      filters
    );
    if (!avatar || avatar === null) {
      throw new NotFoundException("Avatar not found");
    }
    return avatar;
  }

  @Get(":contactId/avatar-url")
  @Version("1")
  @ApiOperation({ summary: "Get contact avatar url by ID" })
  @ApiResponse({
    status: 200,
    description: "SVG avatar url",
  })
  @ApiParam({ name: "contactId", required: true, type: String })
  @ApiQuery({ name: "deleted", required: false, type: Boolean })
  async getContactAvatarUrl(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req: any,
    @Param("contactId") contactId: string,
    @Query("deleted") deleted?: boolean
  ): Promise<string | undefined> {
    this.logRequest(req, `getContactAvatarUrl with id: ${contactId}`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    const filtres: IFindContactsFilters = {};
    if (deleted !== undefined) {
      filtres.deleted = deleted;
    }
    return this.httpContactService.getContactAvatarUrl(
      loggedUser,
      contactId,
      filtres
    );
  }

  @Get(":contactId")
  @Version("1")
  @ApiOperation({ summary: "Get contact by ID" })
  @ApiParam({ name: "contactId", required: true, type: String })
  async getContactById(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req: any,
    @Param("contactId") contactId: string
  ): Promise<Contact | null> {
    this.logRequest(req, `getContactById with id: ${contactId}`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpContactService.getContactById(loggedUser, contactId);
  }

  @Put(":contactId")
  @Version("1")
  @ApiOperation({ summary: "Update contact (replace)" })
  @ApiParam({ name: "contactId", required: true, type: String })
  async updateContact(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req: any,
    @Param("contactId") contactId: string,
    @Body() contactDto: ContactDto
  ): Promise<Contact> {
    this.logRequest(req, `updateContact with id: ${contactId}`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpContactService.updateContact(
      loggedUser,
      contactId,
      contactDto
    );
  }

  @Patch(":contactId")
  @Version("1")
  @ApiOperation({ summary: "Patch contact (partial update)" })
  @ApiParam({ name: "contactId", required: true, type: String })
  async patchContact(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req: any,
    @Param("contactId") contactId: string,
    @Body() contactDto: ContactDto
  ): Promise<Contact> {
    this.logRequest(req, `patchContact with id: ${contactId}`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpContactService.patchContact(
      loggedUser,
      contactId,
      contactDto
    );
  }

  @Delete(":contactId")
  @Version("1")
  @ApiOperation({ summary: "Delete contact by ID" })
  @ApiParam({ name: "contactId", required: true, type: String })
  async deleteContact(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req: any,
    @Param("contactId") contactId: string
  ): Promise<Contact> {
    this.logRequest(req, `deleteContact with id: ${contactId}`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpContactService.deleteContact(loggedUser, contactId);
  }

  @Post(":contactId/restore")
  @Version("1")
  @ApiOperation({ summary: "Restore deleted contact by ID" })
  @ApiParam({ name: "contactId", required: true, type: String })
  async restoreContact(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req: any,
    @Param("contactId") contactId: string
  ): Promise<Contact | null> {
    this.logRequest(req, `restoreContact with id: ${contactId}`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpContactService.restoreContact(loggedUser, contactId);
  }

  @Post()
  @Version("1")
  @ApiOperation({ summary: "Create a new contact" })
  async createContact(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req: any,
    @Body() ContactDto: ContactDto
  ): Promise<Contact> {
    this.logRequest(req, `createContact`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpContactService.createContact(loggedUser, ContactDto);
  }

  @Delete("trash/:contactId")
  @Version("1")
  @ApiOperation({ summary: "Empty trash for contacts" })
  @ApiParam({ name: "contactId", required: true, type: String })
  async deleteContactFromTrash(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Req() req: any,
    @Param("contactId") contactId: string
  ): Promise<void> {
    this.logRequest(req, `deleteContactFromTrash with id: ${contactId}`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpContactService.deleteContactFromTrash(
      loggedUser,
      contactId
    );
  }
}
