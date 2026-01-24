import { PhoneType } from "./phone.enum.js";

export interface IPhone {
  id?: string;
  number: string;
  type?: PhoneType;
  isPreferred?: boolean;
  label?: string;
  tenantId?: string;
  contactId?: string;
}
