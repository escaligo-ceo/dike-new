import {
  Address,
  AppLogger,
  Company,
  Contact,
  ContactAutocompleteDto,
  ContactMapper,
  CONTACTS_AUTOCOMPLETE_DEFAULT_LIMIT,
  CreateContactFromImportDto,
  Email,
  IBulkError,
  IBulkResponse,
  IFindContactsFilters,
  IImportOptions,
  inspect,
  Phone,
  Website,
} from "@dike/common";
import { AuditService, LoggedUser } from "@dike/communication";
import {
  AddressDto,
  addressFingerprint,
  ChatDto,
  CompanyDto,
  ContactDto,
  EmailDto,
  IAddress,
  IChat,
  ICompany,
  IContact,
  IEmail,
  IPhone,
  ITaxIdentifier,
  IWebsite,
  normalize,
  PhoneDto,
  TaxIdentifierDto,
  WebsiteDto,
} from "@dike/contracts";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    public contactRepository: Repository<Contact>,
    @InjectRepository(Address)
    public addressRepository: Repository<Address>,
    @InjectRepository(Website)
    public websiteRepository: Repository<Website>,
    @InjectRepository(Phone)
    public phoneRepository: Repository<Phone>,
    @InjectRepository(Email)
    public emailRepository: Repository<Email>,
    @InjectRepository(Company)
    public companyRepository: Repository<Company>,
    private readonly auditService: AuditService,
    private readonly logger: AppLogger,
  ) {
    this.logger = new AppLogger(ContactService.name);
  }

  /**
   * Find all contacts for a tenant
   * @param {LoggedUser} loggedUser - the user performing the operation
   * @param {IFindContactsFilters} filters - filtering options
   * @param {string} [filters.createdBy] - filter by creator user ID
   * @param {string} [filters.assignedTo] - filter by assignee user ID
   * @param {string} [filters.search] - text search for name, surname or email
   * @param {number} [filters.page] - page number for pagination
   * @param {number} [filters.limit] - page size for pagination
   * @param {boolean} [filters.deleted=false] - whether to include deleted contacts
   * @returns {Promise<{
   *   items: Contact[];
   *   total: number;
   *   page: number;
   *   limit: number;
   * }>} - the list of contacts
   */
  async findAll(
    loggedUser: LoggedUser,
    filters: IFindContactsFilters = {}
  ): Promise<{
    items: IContact[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Risolvo "me" senza mutare options
    const resolvedCreatedBy =
      filters.createdBy === "me" || filters.createdBy === undefined
        ? loggedUser.id
        : filters.createdBy;
    const resolvedAssignedTo =
      filters.assignedTo === "me" || filters.assignedTo === undefined
        ? loggedUser.id
        : filters.assignedTo;

    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 25;
    const skip = (page - 1) * limit;
    const deleted = filters.deleted ?? false;

    const [contacts, total]: [Contact[], number] = await this.contactRepository.findAndCount({
      where: {
        tenantId: loggedUser.tenantId,
        deletedAt: deleted ? Not(IsNull()) : IsNull(),
      },
      withDeleted: deleted,
      relations: [
        "company",
        "emails",
        "phones",
        "addresses",
        "taxIdentifiers",
        "websites",
      ],
      skip,
      take: limit,
    });

    const items = contacts.map((contact) => ContactMapper.toDto(contact));

    this.auditService.safeLog(
      loggedUser,
      "GET_CONTACT",
      `Fetched contacts\nFilters: ${JSON.stringify({
        createdBy: resolvedCreatedBy,
        assignedTo: resolvedAssignedTo,
        search: filters.search,
        page,
        limit,
      })}\nResult count: ${items.length} / Total: ${total}`
    );

    return { items, total, page, limit };
  }

  /**
   * Find a contact by its ID
   * @param {LoggedUser} loggedUser - the user performing the operation
   * @param {string} contactId - the ID of the contact to be found
   * @param {IFindContactsFilters} filters - options for finding the contact
   * @param {boolean} [filters.deleted=false] - whether to include deleted contacts
   * @returns {Promise<Contact | null>} - the found contact or null if not found
   */
  async findById(
    loggedUser: LoggedUser,
    contactId: string,
    filters: IFindContactsFilters = { deleted: false }
  ): Promise<Contact | null> {
    const tenantId: string = loggedUser.tenantId;
    const res = await this.contactRepository.findOne({
      where: {
        id: contactId,
        tenantId,
      },
      withDeleted: filters.deleted ?? false,
      relations: [
        "company",
        "emails",
        "phones",
        "addresses",
        "taxIdentifiers",
        // "chats", // FIXME: da implementare
        // "webSites", // FIXME: da implementare
      ],
    });
    this.auditService.safeLog(
      loggedUser,
      "GET_CONTACT",
      `Fetched contact for contactId: ${contactId}`,
      { contactId, tenantId, filters }
    );
    return res;
  }

  /**
   * Create a new contact
   * @param {LoggedUser} loggedUser - the user performing the operation
   * @param {ContactDto} contactDto - the contact data
   * @returns {Promise<Contact>} - the created contact
   */
  async create(
    loggedUser: LoggedUser,
    contactInput: IContact
  ): Promise<Contact> {
    const contactDto = new ContactDto(contactInput);
    const {
      company: companyDto,
      phones: phoneDtos,
      emails: emailDtos,
      addresses: addressDtos,
      websites: websiteDtos,
      taxIdentifiers: taxIdentifierDtos,
      chats: chatDtos,
      ...contactData
    } = contactDto;

    const instance = this.contactRepository.create({
      ...contactData,

      ownerId: loggedUser.id,
      tenantId: loggedUser.tenantId,
    });
    const savedContact = await this.contactRepository.save(instance);

    const contact = Array.isArray(savedContact)
      ? savedContact[0]
      : savedContact;

    const contactId = contact.id;

    let company: ICompany | null = null;
    let addresses: IAddress[] = [];
    let phones: IPhone[] = [];
    let emails: IEmail[] = [];
    let websites: IWebsite[] = [];
    let chats: IChat[] = [];
    let taxIdentifiers: ITaxIdentifier[] = [];

    if (companyDto)
      company = await this.findOrCreateCompany(loggedUser, contact, companyDto);
    if (addressDtos)
      addresses = await this.findOrCreateAddresses(
        loggedUser,
        contact,
        addressDtos
      );
    if (phoneDtos)
      phones = await this.findOrCreatePhones(loggedUser, contact, phoneDtos);
    if (emailDtos)
      emails = await this.findOrCreateEmails(loggedUser, contact, emailDtos);
    if (websiteDtos)
      websites = await this.findOrCreateWebsites(
        loggedUser,
        contact,
        websiteDtos
      );
    if (chatDtos)
      chats = await this.findOrCreateChats(loggedUser, contact, chatDtos);
    if (taxIdentifierDtos)
      taxIdentifiers = await this.findOrCreateTaxIdentifiers(
        loggedUser,
        contact,
        taxIdentifierDtos
      );

    this.auditService.safeLog(
      loggedUser,
      "CREATE_CONTACT",
      `Created new contact with ID: ${contactId}`,
      {
        ...contact,
        company,
        addresses,
        phones,
        emails,
        websites,
        chats,
        taxIdentifiers,
      }
    );
    return contact;
  }

  async findOrCreateCompany(
    loggedUser: LoggedUser,
    contact: Contact,
    CompanyDto: CompanyDto
  ): Promise<ICompany> {
    const res: Company | null = await this.companyRepository.findOne({
      where: {
        id: CompanyDto?.id,
        ownerId: loggedUser.id,
        tenantId: loggedUser.tenantId,
        contactId: contact.id,
      },
    });
    if (res) {
      const { addresses, phones, emails, ...companyDataWithoutDtos } =
        CompanyDto;
      Object.assign(res, companyDataWithoutDtos);
      res.updatedAt = new Date();
      await this.companyRepository.save(res);
      this.auditService.safeLog(
        loggedUser,
        "UPDATE_COMPANY",
        `Updated company with ID: ${res.id}`,
        { ...res }
      );
      return res;
    }
    const { addresses, phones, emails, ...companyDataWithoutDtos } = CompanyDto;
    const newCompany = this.companyRepository.create({
      ...companyDataWithoutDtos,
      ownerId: loggedUser.id,
      tenantId: loggedUser.tenantId,
      contactId: contact.id,
      contact,
    });
    return this.companyRepository.save<Company>(newCompany);
  }

  async findOrCreateAddresses(
    loggedUser: LoggedUser,
    contact: Contact,
    addressDtos: AddressDto[]
  ): Promise<IAddress[]> {
    if (!addressDtos || addressDtos.length === 0) {
      return [];
    }
    const response: Address[] = [];
    await Promise.all(
      addressDtos.map(async (addr) => {
        const streetNormalized = normalize(addr.street);
        const street2Normalized = normalize(addr.street2);
        const cityNormalized = normalize(addr.city);
        const stateNormalized = normalize(addr.state);
        const postalCodeNormalized = normalize(addr.postalCode);
        const countryNormalized = normalize(addr.country);
        const poBoxNormalized = normalize(addr.poBox);

        const fingerprint = addressFingerprint(
          streetNormalized,
          street2Normalized,
          cityNormalized,
          stateNormalized,
          postalCodeNormalized,
          countryNormalized
        );
        let address: Address | null = await this.addressRepository.findOne({
          where: {
            fingerprint: fingerprint,
            contactId: contact.id,
            // ownerId: loggedUser.id, // non usiamo l'owner il responsabile del numero non ha nulla a che fare con la sua estrazione/lettura del db
            tenantId: loggedUser.tenantId,
          },
        });

        if (!address || address === null) {
          const addressInstances = this.addressRepository.create({
            ...addr,
            street: streetNormalized,
            street2: street2Normalized,
            city: cityNormalized,
            state: stateNormalized,
            postalCode: postalCodeNormalized,
            country: countryNormalized,
            poBox: poBoxNormalized,
            fingerprint: fingerprint,
            contactId: contact.id,
            ownerId: loggedUser.id, // qui invece lo usiamo perchè il creatore del record è effettivamente l'owner
            tenantId: loggedUser.tenantId,
            contact,
          });
          const addressInstance = Array.isArray(addressInstances)
            ? addressInstances[0]
            : addressInstances;
          const addresses =
            await this.addressRepository.save<Address>(addressInstance);
          address = Array.isArray(addresses) ? addresses[0] : addresses;
          response.push(address);
          return;
        }

        Object.assign(address, addr);
        address.updatedAt = new Date();
        response.push(address);
        return;
      })
    );
    return response;
  }

  async findOrCreatePhones(
    loggedUser: LoggedUser,
    contact: Contact,
    phoneDtos: PhoneDto[]
  ): Promise<IPhone[]> {
    if (!phoneDtos || phoneDtos.length === 0) {
      return [];
    }
    const response: Phone[] = [];
    await Promise.all(
      phoneDtos.map(async (ph) => {
        const numberNormalized = normalize(ph.number);
        let phone: Phone | null = await this.phoneRepository.findOne({
          where: {
            number: numberNormalized,
            contactId: contact.id,
            // ownerId: loggedUser.id, // non usiamo l'owner il responsabile del numero non ha nulla a che fare con la sua estrazione/lettura del db
            tenantId: loggedUser.tenantId,
          },
        });

        if (!phone || phone === null) {
          const phoneInstances = this.phoneRepository.create({
            ...ph,
            number: numberNormalized,
            contactId: contact.id,
            ownerId: loggedUser.id, // qui invece lo usiamo perchè il creatore del record è effettivamente l'owner
            tenantId: loggedUser.tenantId,
            contact,
          });
          const phoneInstance = Array.isArray(phoneInstances)
            ? phoneInstances[0]
            : phoneInstances;
          const phones = await this.phoneRepository.save<Phone>(phoneInstance);
          phone = Array.isArray(phones) ? phones[0] : phones;
          response.push(phone);
          return;
        }

        Object.assign(phone, ph);
        phone.updatedAt = new Date();
        response.push(phone);
        return;
      })
    );
    return response;
  }

  async findOrCreateEmails(
    loggedUser: LoggedUser,
    contact: Contact,
    emailDtos: EmailDto[]
  ): Promise<IEmail[]> {
    if (!emailDtos || emailDtos.length === 0) {
      return [];
    }
    const response: Email[] = [];
    await Promise.all(
      emailDtos.map(async (em) => {
        const emailNormalized = normalize(em.email);
        let email: Email | null = await this.emailRepository.findOne({
          where: {
            email: emailNormalized,
            contactId: contact.id,
            // ownerId: loggedUser.id, // non usiamo l'owner il responsabile del numero non ha nulla a che fare con la sua estrazione/lettura del db
            tenantId: loggedUser.tenantId,
          },
        });

        if (!email || email === null) {
          const emailInstances = this.emailRepository.create({
            ...em,
            email: emailNormalized,
            contactId: contact.id,
            ownerId: loggedUser.id, // qui invece lo usiamo perchè il creatore del record è effettivamente l'owner
            tenantId: loggedUser.tenantId,
            contact,
          });
          const emailInstance = Array.isArray(emailInstances)
            ? emailInstances[0]
            : emailInstances;
          const emails = await this.emailRepository.save<Email>(emailInstance);
          email = Array.isArray(emails) ? emails[0] : emails;
          response.push(email);
          return;
        }

        Object.assign(email, em);
        email.updatedAt = new Date();
        response.push(email);
        return;
      })
    );
    return response;
  }

  async findOrCreateWebsites(
    loggedUser: LoggedUser,
    contact: Contact,
    websiteDtos: WebsiteDto[]
  ): Promise<IWebsite[]> {
    if (!websiteDtos || websiteDtos.length === 0) {
      return [];
    }
    const response: Website[] = [];
    await Promise.all(
      websiteDtos.map(async (ws) => {
        const urlNormalized = normalize(ws.url);
        let website: Website | null = await this.websiteRepository.findOne({
          where: {
            url: urlNormalized,
            contactId: contact.id,
            // ownerId: loggedUser.id, // non usiamo l'owner il responsabile del numero non ha nulla a che fare con la sua estrazione/lettura del db
            tenantId: loggedUser.tenantId,
          },
        });

        if (!website || website === null) {
          const websiteInstances = this.websiteRepository.create({
            ...ws,
            url: urlNormalized,
            contactId: contact.id,
            ownerId: loggedUser.id, // qui invece lo usiamo perchè il creatore del record è effettivamente l'owner
            tenantId: loggedUser.tenantId,
            contact,
          });
          const websiteInstance = Array.isArray(websiteInstances)
            ? websiteInstances[0]
            : websiteInstances;
          const websites = await this.websiteRepository.save<Website>(
            websiteInstance
          );
          website = Array.isArray(websites) ? websites[0] : websites;
          if (website)
            response.push(website);
          return;
        }

        Object.assign(website, ws);
        website.updatedAt = new Date();
        response.push(website);
        return;
      })
    );
    return response;
  }

  async findOrCreateChats(
    loggedUser: LoggedUser,
    contact: Contact,
    chatDtos: ChatDto[]
  ): Promise<IChat[]> {
    if (!chatDtos || chatDtos.length === 0) {
      return [];
    }
    const response: any[] = [];
    await Promise.all(
      chatDtos.map(async (chat) => {
        const chatInstances = {
          ...chat,
          contactId: contact.id,
          ownerId: loggedUser.id,
          tenantId: loggedUser.tenantId,
          contact,
        };
        response.push(chatInstances);
        return;
      })
    );
    return response;
  }

  async findOrCreateTaxIdentifiers(
    loggedUser: LoggedUser,
    contact: Contact,
    taxIdentifierDtos: TaxIdentifierDto[]
  ): Promise<ITaxIdentifier[]> {
    if (!taxIdentifierDtos || taxIdentifierDtos.length === 0) {
      return [];
    }
    const response: any[] = [];
    await Promise.all(
      taxIdentifierDtos.map(async (taxIdentifier) => {
        const taxIdentifierInstances = {
          ...taxIdentifier,
          contactId: contact.id,
          ownerId: loggedUser.id,
          tenantId: loggedUser.tenantId,
          contact,
        };
        response.push(taxIdentifierInstances);
        return;
      })
    );
    return response;
  }

  /**
   * Replace contact data
   * @param {LoggedUser} loggedUser- the user performing the operation
   * @param {string} contactId - the ID of the contact to be replaced
   * @param {Partial<Contact>} updateDto - the new contact data
   * @returns {Promise<Contact>} - the updated contact
   */
  async replace(
    loggedUser: LoggedUser,
    contactId: string,
    updateDto: Partial<Contact>
  ): Promise<Contact> {
    const tenantId: string = loggedUser.tenantId;
    const contact = await this.contactRepository.findOne({
      where: { id: contactId, tenantId },
    });
    if (!contact || contact === null) throw new Error("Contatto non trovato");

    Object.assign(contact, updateDto);
    contact.updatedAt = new Date();

    await this.contactRepository.save(contact);

    this.auditService.safeLog(
      loggedUser,
      "REPLACE_CONTACT",
      `Updated contact with ID: ${contactId}`,
      { ...contact }
    );

    return contact;
  }

  /**
   * Delete a contact by its ID (soft delete)
   * @param {LoggedUser} loggedUser - the user performing the operation
   * @param {string} id - the ID of the contact to be deleted
   * @returns {Promise<Contact>} - the deleted contact
   */
  async delete(loggedUser: LoggedUser, id: string): Promise<Contact> {
    const tenantId: string = loggedUser.tenantId;
    const contact = await this.findById(loggedUser, id);
    if (!contact || contact === null) throw new Error("Contatto non trovato");

    // Soft delete: imposta deletedAt al timestamp attuale
    const now = new Date();
    this.logger.debug(
      `Soft deleting contact ${id}, setting deletedAt to ${now.toISOString()}`
    );

    const result = await this.contactRepository.update(
      { id, tenantId },
      { deletedAt: now }
    );

    this.logger.debug(
      `Update result for contact ${id}: ${JSON.stringify(result)}`
    );

    if (result.affected !== 1) {
      this.logger.error(
        `ATTENTION: Delete affected ${result.affected} records instead of 1! ID: ${id}, TenantId: ${tenantId}`
      );
    }

    // Audit log
    this.auditService.safeLog(
      loggedUser,
      "DELETE_CONTACT",
      `Deleted contact ${id}, deletedAt: ${now.toISOString()}`
    );

    return contact;
  }

  /**
   * Restore a contact by its ID (undo soft delete)
   * @param {LoggedUser} loggedUser - the user performing the operation
   * @param {string} id - the ID of the contact to be restored
   * @returns {Promise<void>}
   */
  async restore(loggedUser: LoggedUser, id: string): Promise<Contact> {
    const tenantId: string = loggedUser.tenantId;

    // Find the deleted contact with withDeleted scope
    const contact = await this.contactRepository
      .createQueryBuilder("contact")
      .withDeleted()
      .where("contact.id = :id AND contact.tenantId = :tenantId", {
        id,
        tenantId,
      })
      .getOne();

    if (!contact || contact === null) throw new Error("Contatto non trovato");

    // Restore: imposta deletedAt a NULL
    this.logger.debug(`Restoring contact ${id}, setting deletedAt to NULL`);

    const result = await this.contactRepository.update(
      { id, tenantId },
      { deletedAt: null }
    );

    this.logger.debug(
      `Update result for contact ${id}: ${JSON.stringify(result)}`
    );

    if (result.affected !== 1) {
      this.logger.error(
        `ATTENTION: Restore affected ${result.affected} records instead of 1! ID: ${id}, TenantId: ${tenantId}`
      );
    }

    // Audit log
    this.auditService.safeLog(
      loggedUser,
      "RESTORE_CONTACT",
      `Restored contact ${id}`
    );

    return contact;
  }

  /**
   * Update contact data
   * @param {LoggedUser} loggedUser - the user performing the operation
   * @param {string} contactId - the ID of the contact to be updated
   * @param {Partial<Contact>} contactData - the new contact data
   * @returns {Promise<Contact>} - the updated contact
   */
  async update(
    loggedUser: LoggedUser,
    contactId: string,
    contactData: Partial<Contact>
  ): Promise<Contact> {
    const tenantId: string = loggedUser.tenantId;
    const contact = await this.contactRepository.findOne({
      where: { id: contactId, tenantId },
    });
    if (!contact || contact === null) throw new Error("Contatto non trovato");

    Object.assign(contact, contactData);
    contact.updatedAt = new Date();

    await this.contactRepository.save(contact);

    this.auditService.safeLog(
      loggedUser,
      "UPDATE_CONTACT",
      `Updated contact with ID: ${contactId}`,
      { ...contact }
    );

    return contact;
  }

  /**
   * Import contacts in bulk
   * @param {LoggedUser} loggedUser - the user performing the operation
   * @param {CreateContactFromImportDto[]} importedContacts - the contacts to be imported
   * @param {IImportOptions} options - import options
   * @param {boolean} [options.continueOnError=false] - whether to skip duplicate contacts
   * @param {boolean} [options.dryRun=false] - whether to notify the user after import
   * @param {number} [options.chunkSize=50] - maximum number of contacts to import in any chunk
   * @returns {Promise<IBulkResponse<Contact>>} - the result of the import operation
   */
  async importContacts(
    loggedUser: LoggedUser,
    importedContacts: CreateContactFromImportDto[],
    options: IImportOptions
  ): Promise<IBulkResponse<CreateContactFromImportDto>> {
    let total = 0;
    let created = 0;
    let failed = 0;
    let errors: IBulkError<CreateContactFromImportDto>[] = [];
    // const { chunkSize = 50, dryRun = true, continueOnError = true } = options;

    for (const contactData of importedContacts) {
      try {
        const newContact = this.contactRepository.create({
          ...contactData,
          ownerId: loggedUser.id,
          tenantId: loggedUser.tenantId,
        });
        await this.contactRepository.save(newContact);
        created++;
      } catch (error) {
        this.logger.error(
          `Failed to import contact at index ${total}: ${error.message}`
        );
        failed++;
        errors.push({
          index: total,
          reason: error.message,
          row: contactData,
        });
      }
      total++;
    }

    this.auditService.safeLog(
      loggedUser,
      "IMPORT_CONTACTS",
      `Imported ${total} contacts`
    );

    return {
      total, // numero totale righe processate
      created, // righe effettivamente salvate
      failed, // righe fallite
      errors, // dettagli degli errori
    };
  }

  async bulkCreateContacts(
    loggedUser: LoggedUser,
    chunkData: { data: CreateContactFromImportDto[] }
  ): Promise<IBulkResponse<CreateContactFromImportDto>> {
    const createdContacts: Contact[] = [];
    const tenantId = loggedUser.tenantId;
    const ownerId = loggedUser.id;
    const errors: IBulkError<CreateContactFromImportDto>[] = [];
    for (const contactData of chunkData.data) {
      this.logger.debug(inspect(contactData));
      try {
        const extractedTenantId = contactData.tenantId || tenantId;
        const extractedOwnerId = contactData.ownerId || ownerId;
        const {
          phoneticFirstName,
          phoneticLastName,
          // birthday,
          // anniversary,
          // photoUrl,
          // customType,
          // typeId,
          // labels,
          // roles,
          // typeId,
          // type,
          photoUrl,
          typeId,
          customType,
          labels,
          type,
          nickname,
          roles,
          company,
          phones,
          websites,
          addresses,
          emails,
          birthday,
          anniversary,
          ...extractedContactData
        } = contactData.contact;
        const contactInstance = {
          ...extractedContactData,
          ownerId: extractedOwnerId,
          tenantId: extractedTenantId,
        };
        const newContact = this.contactRepository.create(contactInstance);
        const savedContact = await this.contactRepository.save(newContact);
        createdContacts.push(savedContact);

        const newAddresses: Address[] = [];
        if (Array.isArray(addresses) && addresses.length > 0) {
          for (const addr of addresses) {
            const { type, ...extractedAddrData } = addr;
            const addressEntity = this.addressRepository.create({
              ...extractedAddrData,
              tenantId: extractedTenantId,
              ownerId: extractedOwnerId,
              contact: savedContact,
            });
            newAddresses.push(addressEntity);
          }
          await this.addressRepository.save(newAddresses);
        }

        const newPhones: Phone[] = [];
        if (Array.isArray(phones) && phones.length > 0) {
          for (const ph of phones) {
            const { type, ...extractedPhoneData } = ph;
            const phoneEntity = this.phoneRepository.create({
              ...extractedPhoneData,
              tenantId: extractedTenantId,
              ownerId: extractedOwnerId,
              contact: savedContact,
            });
            newPhones.push(phoneEntity);
          }
          await this.phoneRepository.save(newPhones);
        }

        const newEmails: Email[] = [];
        if (Array.isArray(emails) && emails.length > 0) {
          for (const em of emails) {
            const { type, ...extractedEmailData } = em;
            const emailEntity = this.emailRepository.create({
              ...extractedEmailData,
              tenantId: extractedTenantId,
              ownerId: extractedOwnerId,
              contact: savedContact,
            });
            newEmails.push(emailEntity);
          }
          await this.emailRepository.save(newEmails);
        }

        if (company) {
          const newCompany: Company = this.companyRepository.create({
            ...company,
            tenantId: extractedTenantId,
            ownerId: extractedOwnerId,
            contact: savedContact,
          });
          await this.companyRepository.save(newCompany);
        }
      } catch (error) {
        this.logger.error(`Failed to bulk create contact: ${error.message}`);
        errors.push({
          index: createdContacts.length + errors.length,
          reason: error.message,
          row: contactData,
        });
      }
    }

    this.auditService.safeLog(
      loggedUser,
      "BULK_CREATE_CONTACTS",
      `Bulk created ${createdContacts.length} contacts`
    );

    return {
      total: chunkData.data.length,
      created: createdContacts.length,
      failed: errors.length,
      errors,
    };
  }

  async count(
    loggedUser: LoggedUser,
    filters: IFindContactsFilters = {}
  ): Promise<number> {
    const count = await this.contactRepository.count({
      where: {
        tenantId: loggedUser.tenantId,
        deletedAt: filters.deleted ? Not(IsNull()) : IsNull(),
      },
      withDeleted: filters.deleted ?? false,
    });
    return count;
  }

  /**
   * Retrieve the total count of contacts for a tenant
   * @param {LoggedUser} loggedUser - the user performing the operation
   * @param {IFindContactsFilters} filters - filtering options
   * @param {string} [filters.createdBy] - filter by creator user ID
   * @param {string} [filters.assignedTo] - filter by assignee user ID
   * @param {string} [filters.search] - text search for name, surname or email
   * @param {number} [filters.page] - page number for pagination
   * @param {number} [filters.limit] - page size for pagination
   * @param {boolean} [filters.deleted=false] - whether to include deleted contacts
   * @returns {Promise<number>} - the total count of contacts matching the filters
   */
  async getContactsCount(
    loggedUser: LoggedUser,
    filters: IFindContactsFilters = {}
  ): Promise<number> {
    return this.count(loggedUser, {
      ...filters,
      deleted: filters.deleted ?? false,
    });
  }

  /**
   * Retrieve deleted contacts from trash
   * @param {LoggedUser} loggedUser - the user performing the operation
   * @param {IFindContactsFilters} filters - filtering options
   * @param {string} [filters.createdBy] - filter by creator user ID
   * @param {string} [filters.assignedTo] - filter by assignee user ID
   * @param {string} [filters.search] - text search for name, surname or email
   * @param {number} [filters.page] - page number for pagination
   * @param {number} [filters.limit] - page size for pagination
   * @returns {Promise<{items: Contact[], total: number, page: number, limit: number}>} - the list of trashed contacts with pagination info
   */
  async getTrashedContacts(
    loggedUser: LoggedUser,
    filters: IFindContactsFilters
  ): Promise<{ items: Contact[]; total: number; page: number; limit: number }> {
    // Risolvo "me" senza mutare options
    const resolvedCreatedBy =
      filters.createdBy === "me" || filters.createdBy === undefined
        ? loggedUser.id
        : filters.createdBy;
    const resolvedAssignedTo =
      filters.assignedTo === "me" || filters.assignedTo === undefined
        ? loggedUser.id
        : filters.assignedTo;

    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 25;
    const skip = (page - 1) * limit;

    // IMPORTANTE: Usiamo createQueryBuilder con .withDeleted() per disabilitare il soft delete scope
    // che viene aggiunto automaticamente da @DeleteDateColumn()
    const [items, total] = await this.contactRepository.findAndCount({
      where: {
        tenantId: loggedUser.tenantId,
        deletedAt: filters.deleted ? Not(IsNull()) : IsNull(),
      },
      withDeleted: true,
      relations: ["company", "emails", "phones"],
      skip,
      take: limit,
    });

    // Audit log
    this.auditService.safeLog(
      loggedUser,
      "GET_TRASHED_CONTACT",
      `Fetched trashed contacts\nFilters: ${JSON.stringify({
        createdBy: resolvedCreatedBy,
        assignedTo: resolvedAssignedTo,
        page,
        limit,
      })}\nResult count: ${items.length} / Total: ${total}`
    );

    return { items, total, page, limit };
  }

  async restoreContact(
    loggedUser: LoggedUser,
    contactId: string
  ): Promise<Contact | null> {
    this.logger.debug(
      `[restoreContact] Called for contactId ${contactId} by user ${loggedUser.id}`
    );

    const where = { id: contactId, tenantId: loggedUser.tenantId };
    const contact = await this.contactRepository.findOne({ where });

    // if (!contact || contact === null) {
    //   this.logger.error(
    //     `[restoreContact] Contact with id ${contactId} not found for tenantId ${loggedUser.tenantId}: ${inspect(where)}`
    //   );
    //   throw new Error("Contatto non trovato");
    // }

    await this.contactRepository.update({ ...where }, { deletedAt: null });

    return contact;
  }

  /**
   * Retrieve a list of contacts matching the search term for autocomplete
   * @param {LoggerUser} loggedUser - the user performing the operation
   * @param {string} searchTerm - the term to search for in contacts
   * @param {number} limit - the maximum number of contacts to return
   * @returns {Promise<ContactAutocompleteDto[]>} - a promise that resolves to an array of contacts
   */
  async autocompleteContacts(
    loggedUser: LoggedUser,
    searchTerm: string,
    limit: number = CONTACTS_AUTOCOMPLETE_DEFAULT_LIMIT
  ): Promise<ContactAutocompleteDto[]> {
    const tenantId: string = loggedUser.tenantId;

    const queryBuilder = this.contactRepository
      .createQueryBuilder("contact")
      .where("contact.tenantId = :tenantId", { tenantId })
      .andWhere("contact.deletedAt IS NULL");

    if (searchTerm && searchTerm.trim() !== "") {
      queryBuilder.andWhere(
        "(contact.firstName ILIKE :search OR contact.lastName ILIKE :search)",
        { search: `%${searchTerm}%` }
      );
    }

    queryBuilder.take(limit);

    const contacts = await queryBuilder.getMany();

    const results: ContactAutocompleteDto[] = contacts.map((contact) => {
      return new ContactAutocompleteDto(contact);
    });

    return results;
  }

  async getContactAvatar(
    loggedUser: LoggedUser,
    contactId: string,
    filters: IFindContactsFilters = { deleted: false }
  ): Promise<any> {
    const contact = await this.findById(loggedUser, contactId, {
      deleted: filters.deleted,
    });
    if (!contact || contact === null) {
      throw new NotFoundException("Contatto non trovato");
    }
    const svg = contact.avatar;
    // Ritorna l'SVG raw - la conversione a base64 avviene nel gateway
    return svg;
  }

  async deleteContactFromTrash(
    loggedUser: LoggedUser,
    contactId: string
  ): Promise<void> {
    this.logger.debug(
      `[deleteContactFromTrash] Called for contactId ${contactId} by user ${loggedUser.id}`
    );

    const where = { id: contactId, tenantId: loggedUser.tenantId };
    const contact = await this.contactRepository.findOne({
      where,
      withDeleted: true,
    });

    if (!contact) {
      this.logger.error(
        `[deleteContactFromTrash] Contact with id ${contactId} not found for tenantId ${loggedUser.tenantId}: ${JSON.stringify(where)}`
      );
      throw new NotFoundException("Contatto non trovato");
    }

    await this.contactRepository.delete(where);
  }
}
