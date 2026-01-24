import { AddressDto } from "./address.dto.js";
import { ICompany } from "./company.interface.js";
import { EmailDto } from "./email.dto.js";
import { PhoneDto } from "./phone.dto.js";
import { TaxIdentifierDto } from "./tax-identifier.dto.js";

export class CompanyDto implements ICompany {
  id: string;
  name: string;
  title?: string;
  department?: string;
  officeLocation?: string;
  SDICode?: string; // FIXME: verificare se va bene così
  addresses?: Array<AddressDto>;
  phones?: Array<PhoneDto>;
  emails?: Array<EmailDto>;
  taxIdentifiers?: Array<TaxIdentifierDto>;
  tenantId?: string;
  contactId?: string;
}
