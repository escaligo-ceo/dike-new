import { EmailType } from "./email.enum.js";

export interface IEmail {
  id: string;
  email: string;
  isPreferred?: boolean;
  label?: string;
  type?: EmailType;
  isPEC?: boolean;
  tenantId?: string;
  contactId?: string;
}
