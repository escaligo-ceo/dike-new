import { YearlyDateDto } from "../app/yearly-date.dto.js";
import { AddressDto } from "./address.dto.js";
import { IAddress } from "./address.interface.js";
import { AnagraphicSex } from "./anagraphic-sex.enum.js";
import { IBirthPlace } from "./birth-place.interface.js";
import { ChatDto } from "./chat.dto.js";
import { IChat } from "./chat.interface.js";
import { CompanyDto } from "./company.dto.js";
import { IContact } from "./contact.interface.js";
import { EmailDto } from "./email.dto.js";
import { IEmail } from "./email.interface.js";
import { PhoneDto } from "./phone.dto.js";
import { IPhone } from "./phone.interface.js";
import { TaxIdentifierDto } from "./tax-identifier.dto.js";
import { ITaxIdentifier } from "./tax-identifier.interface.js";
import { WebsiteDto } from "./web-site.dto.js";
import { IWebsite } from "./web-site.interface.js";

export class ContactDto implements IContact {
  id?: string;
  ownerId?: string;
  tenantId: string;

  firstName?: string;
  lastName?: string;
  fullName?: string;
  prefix?: string;
  middleName?: string;
  phoneticLastName?: string;
  phoneticFirstName?: string;
  suffix?: string;
  nickname?: string;
  photoUrl?: string;
  anagraphicSex?: AnagraphicSex;
  birthPlace?: IBirthPlace;
  notes?: string;
  labels?: string[];

  birthday?: YearlyDateDto;
  anniversary?: YearlyDateDto;

  company?: CompanyDto;
  addresses?: Array<AddressDto>;
  phones?: Array<PhoneDto>;
  emails?: Array<EmailDto>;
  chats?: Array<ChatDto>;
  taxIdentifiers?: Array<TaxIdentifierDto>;
  websites?: Array<WebsiteDto>;

  preferredEmail?: string;
  preferredPhone?: string;
  preferredAddress?: string;
  preferredWebsite?: string;
  personalWebPage?: string;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;

  constructor(data: IContact) {
    this.id = data.id; // FIXME: check if this is correct
    this.ownerId = data.ownerId;

    this.addresses = [];
    this.phones = [];
    this.emails = [];
    this.chats = [];
    this.taxIdentifiers = [];
    this.websites = [];

    const {
      addresses: addressesInput,
      phones: phonesInput,
      emails: emailsInput,
      chats: chatsInput,
      taxIdentifiers: taxIdentifiersInput,
      websites: websitesInput,
      company: companyInput,
      ...contactData
    } = data;
    if (addressesInput) {
      this.addresses = addressesInput.map(
        (addr: IAddress) => {
          const { tenantId, contactId, ...addrData } = addr;
          return Object.assign(new AddressDto(), addrData);
        }
      );
    }
    if (phonesInput) {
      this.phones = phonesInput .map(
        (phone: IPhone) => {
          const { tenantId, contactId, ...phoneData } = phone;
          return Object.assign(new PhoneDto(), phoneData);
        }
      );
    }
    if (emailsInput) {
      this.emails = emailsInput.map(
        (email: IEmail) => {
          const { tenantId, contactId, ...emailData } = email;
          return Object.assign(new EmailDto(), emailData);
        }
      );
    }
    if (chatsInput) {
      this.chats = chatsInput.map(
        (chat: IChat) => {
          const { tenantId, contactId, ...chatData } = chat;
          return Object.assign(new ChatDto(), chatData);
        }
      );
    }
    if (taxIdentifiersInput) {
      this.taxIdentifiers = taxIdentifiersInput.map(
        (taxId: ITaxIdentifier) => {
          const { tenantId, contactId, ...taxIdData } = taxId;
          return Object.assign(new TaxIdentifierDto(), taxIdData);
        }
      );
    }
    if (websitesInput) {
      this.websites = websitesInput.map(
        (ws: IWebsite) => {
          const { tenantId, contactId, ...wsData } = ws;
          return Object.assign(new WebsiteDto(), wsData);
        }
      );
    }
    if (companyInput !== undefined) {
      const { tenantId, contactId, ...companyData } = companyInput;
      this.company = Object.assign(new CompanyDto(), companyData);
    }
    Object.assign(this, contactData);
  }
}
