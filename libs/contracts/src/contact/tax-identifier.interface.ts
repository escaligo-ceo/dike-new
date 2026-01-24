import { TaxIdentifierType } from "./tax-identifier.enum.js";

export interface ITaxIdentifier {
  id: string;
  value: string;
  tenantId?: string;
  contactId?: string;
  type: TaxIdentifierType;
}
