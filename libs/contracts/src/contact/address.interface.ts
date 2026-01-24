import { AddressType } from "./address.enum.js";

export interface IAddress {
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
