import { AddressType } from "./address.enum.js";
import { IAddress } from "./address.interface.js";

export class AddressDto implements IAddress {
  id?: string;
  street?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  type?: AddressType;
  label?: string;
  poBox?: string;
  formatted?: string;
  isPreferred?: boolean;
  tenantId?: string;
  contactId?: string;
}
