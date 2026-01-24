import { IEmail } from "./email.interface.js";
import { EmailType } from "./email.enum.js";

export class EmailDto implements IEmail {
  id: string;
  email: string;
  isPreferred?: boolean;
  label?: string;
  type?: EmailType;
  isPEC?: boolean;
  tenantId?: string;
  contactId?: string;
}
