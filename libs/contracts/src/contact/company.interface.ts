import { AddressDto } from "./address.dto.js";
import { IAddress } from "./address.interface.js";
import { EmailDto } from "./email.dto.js";
import { IEmail } from "./email.interface.js";
import { PhoneDto } from "./phone.dto.js";
import { IPhone } from "./phone.interface.js";
import { TaxIdentifierDto } from "./tax-identifier.dto.js";
import { ITaxIdentifier } from "./tax-identifier.interface.js";

export interface ICompany {
  id: string;
  name: string;
  title?: string;
  department?: string;
  officeLocation?: string;
  SDICode?: string; // FIXME: verificare se va bene così
  addresses?: Array<IAddress>;
  phones?: Array<IPhone>;
  emails?: Array<IEmail>;
  taxIdentifiers?: Array<ITaxIdentifier>;
  tenantId?: string;
  contactId?: string;
}
