import {
  Analytics,
  AppLogger,
  Contact,
  ContactAutocompleteDto,
  CreateContactFromImportDto,
  CurrentUser,
  DikeConfigService,
  IBulkResponse,
  IFindContactsFilters,
  IImportOptions,
} from "@dike/common";
import {
  Audit,
  AuditAction,
  AuditCategory,
  BaseController,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import { ContactDto, IContact } from "@dike/contracts";
import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseInterceptors,
  Version,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ContactService } from "./contact.service";

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags("contacts")
@Controller("contacts")
export class ContactController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    private readonly contactService: ContactService,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
  ) {
    super(new AppLogger(ContactController.name), configService, userFactory);
  }

  @Get()
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Get all contacts for a tenant" })
  @ApiQuery({ name: "createdBy", required: false, type: String })
  @ApiQuery({ name: "assignedTo", required: false, type: String })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getContacts(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
    @Query("createdBy") createdBy?: string,
    @Query("assignedTo") assignedTo?: string,
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ): Promise<{
    items: IContact[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.logRequest(req, `getContacts`);
    const options: IFindContactsFilters = {
      createdBy,
      assignedTo,
      search,
      page,
      limit,
    };
    const res = await this.contactService.findAll(loggedUser, options);
    this.logger.debug(`getContacts.count: ${res.items.length}`);
    return res;
  }

  @Get("count")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Get total count of contacts for a tenant" })
  async getContactsCount(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
  ): Promise<{ count: number }> {
    this.logRequest(req, `getContactsCount`);
    const count = await this.contactService.getContactsCount(loggedUser);
    return { count };
  }

  @Get("trash")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Get deleted contacts from trash" })
  @ApiQuery({ name: "createdBy", required: false, type: String })
  @ApiQuery({ name: "assignedTo", required: false, type: String })
  @ApiQuery({ name: "search", required: false, type: String })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async getTrashedContacts(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
    @Query("createdBy") createdBy?: string,
    @Query("assignedTo") assignedTo?: string,
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ): Promise<{
    items: IContact[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.logRequest(req, `getTrashedContacts`);
    const filters: IFindContactsFilters = {
      createdBy,
      assignedTo,
      search,
      page,
      limit,
    };
    return this.contactService.findAll(loggedUser, {
      ...filters,
      deleted: true,
    });
  }

  @Get("autocomplete")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Search contacts for autocomplete" })
  @ApiQuery({ name: "query", required: true, type: String })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async autocompleteContacts(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
    @Query("query") queryStr: string,
    @Query("limit") limit?: number,
  ): Promise<ContactAutocompleteDto[]> {
    this.logRequest(req, `autocompleteContacts with query: ${queryStr}`);
    return this.contactService.autocompleteContacts(
      loggedUser,
      queryStr,
      limit,
    );
  }

  @Post("import")
  @Version("1")
  @Audit(AuditCategory.CONTACT, AuditAction.IMPORT)
  @ApiOperation({ summary: "Import contacts" })
  async importContacts(
    @CurrentUser() loggedUser: LoggedUser,
    @Body()
    body:
      | {
          items?: CreateContactFromImportDto[];
          importedContacts?: CreateContactFromImportDto[];
          options?: IImportOptions;
        }
      | CreateContactFromImportDto[],
    @Req() req,
  ): Promise<IBulkResponse<Partial<Contact>>> {
    this.logRequest(req, "importContacts");
    const raw: any = body;
    const items: CreateContactFromImportDto[] | undefined = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.items)
        ? raw.items
        : Array.isArray(raw?.importedContacts)
          ? raw.importedContacts
          : undefined;

    if (!Array.isArray(items)) {
      throw new BadRequestException(
        "Invalid payload: expected an array of contacts under 'items' or 'importedContacts'",
      );
    }

    const options: IImportOptions = raw?.options ?? ({} as IImportOptions);

    return this.contactService.importContacts(loggedUser, items, options);
  }

  @Post("bulk")
  @Version("1")
  @Audit(AuditCategory.CONTACT, AuditAction.BULK_CREATE)
  @ApiOperation({ summary: "Bulk create contacts" })
  async bulkCreateContacts(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() chunkData: { data: CreateContactFromImportDto[] },
    @Req() req,
  ): Promise<IBulkResponse<CreateContactFromImportDto>> {
    this.logRequest(req, `bulkCreateContacts`);
    return this.contactService.bulkCreateContacts(loggedUser, chunkData);
  }

  @Get(":contactId")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Get contact by ID" })
  @ApiParam({ name: "contactId", required: true, type: String })
  async getContactById(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
    @Param("contactId") contactId: string,
  ): Promise<Contact | null> {
    this.logRequest(req, `getContactById called with contactId: ${contactId}`);
    const res = await this.contactService.findById(loggedUser, contactId);

    return res !== null ? res : null;
  }

  @Get(":contactId/avatar-url")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Get contact avatar by ID" })
  @ApiParam({ name: "contactId", required: true, type: String })
  @ApiQuery({ name: "deleted", required: false, type: Boolean })
  async getContactAvatarUrl(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
    @Param("contactId") contactId: string,
    @Query("deleted") deleted?: boolean,
  ): Promise<string | undefined> {
    this.logRequest(
      req,
      `getContactAvatarUrl called with contactId: ${contactId}`,
    );
    const contact = await this.contactService.findById(loggedUser, contactId, {
      deleted: deleted ?? false,
    });

    return contact !== null ? contact.avatarUrl : undefined;
  }

  @Get(":contactId/avatar")
  @Version("1")
  @Analytics()
  @Header("Content-Type", "image/svg+xml")
  @ApiOperation({ summary: "Get contact avatar by ID" })
  @ApiResponse({
    status: 200,
    description: "SVG avatar",
    content: { "image/svg+xml": {} },
  })
  @ApiParam({ name: "contactId", required: true, type: String })
  @ApiQuery({ name: "deleted", required: false, type: Boolean })
  async getContactAvatar(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
    @Param("contactId") contactId: string,
    @Query("deleted") deleted?: boolean,
  ): Promise<any> {
    this.logRequest(
      req,
      `getContactAvatar called with contactId: ${contactId}`,
    );
    return this.contactService.getContactAvatar(loggedUser, contactId, {
      deleted: deleted ?? false,
    });
  }

  @Post()
  @Version("1")
  @Audit(AuditCategory.CONTACT, AuditAction.CREATE)
  @ApiOperation({ summary: "Create a new contact" })
  async createContact(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
    @Body() contactDto: ContactDto,
  ): Promise<Contact> {
    this.logRequest(req, `createContact`);
    return this.contactService.create(loggedUser, contactDto);
  }

  @Put(":contactId")
  @Version("1")
  @Audit(AuditCategory.CONTACT, AuditAction.UPDATE)
  @ApiOperation({ summary: "Rewrite contact data" })
  @ApiParam({ name: "contactId", required: true, type: String })
  async updateContact(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
    @Param("contactId") contactId: string,
    @Body() contactData: Partial<Contact>,
  ): Promise<Contact> {
    this.logRequest(req, `updateContact called with contactId: ${contactId}`);
    return this.contactService.replace(loggedUser, contactId, contactData);
  }

  @Patch(":contactId")
  @Version("1")
  @Audit(AuditCategory.CONTACT, AuditAction.UPDATE)
  @ApiOperation({ summary: "Update contact data" })
  @ApiParam({ name: "contactId", required: true, type: String })
  async patchContact(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
    @Param("contactId") contactId: string,
    @Body() contactData: Partial<Contact>,
  ): Promise<Contact> {
    this.logRequest(req, `patchContact called with contactId: ${contactId}`);
    return this.contactService.update(loggedUser, contactId, contactData);
  }

  @Delete(":contactId")
  @Version("1")
  @Audit(AuditCategory.CONTACT, AuditAction.DELETE)
  @ApiOperation({ summary: "Delete a contact by ID" })
  @ApiParam({ name: "contactId", required: true, type: String })
  async deleteContact(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
    @Param("contactId") contactId: string,
  ): Promise<Contact> {
    this.logRequest(req, `deleteContact called with contactId: ${contactId}`);
    return this.contactService.delete(loggedUser, contactId);
  }

  @Post(":contactId/restore")
  @Version("1")
  @Audit(AuditCategory.CONTACT, AuditAction.RESTORE)
  @ApiOperation({ summary: "Restore deleted contact by ID" })
  @ApiParam({ name: "contactId", required: true, type: String })
  async restoreContact(
    @CurrentUser() loggedUser: LoggedUser,
    @Param("contactId") contactId: string,
    @Req() req,
  ): Promise<Contact | null> {
    this.logRequest(req, `restoreContact called with contactId: ${contactId}`);
    return this.contactService.restoreContact(loggedUser, contactId);
  }

  @Delete("trash/:contactId")
  @Version("1")
  @Audit(AuditCategory.CONTACT, AuditAction.PERMANENT_DELETE)
  @ApiOperation({ summary: "Permanently delete a contact from trash by ID" })
  @ApiParam({ name: "contactId", required: true, type: String })
  async deleteContactFromTrash(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
    @Param("contactId") contactId: string,
  ): Promise<void> {
    this.logRequest(
      req,
      `deleteContactFromTrash called with contactId: ${contactId}`,
    );
    return this.contactService.deleteContactFromTrash(loggedUser, contactId);
  }
}
