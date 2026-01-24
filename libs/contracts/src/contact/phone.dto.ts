import { PhoneType } from "./phone.enum.js";
import { IPhone } from "./phone.interface.js";

export class PhoneDto implements IPhone {
  id?: string;
  number: string;
  type?: PhoneType;
  isPreferred?: boolean;
  label?: string;
  tenantId?: string;
  contactId?: string;
}
