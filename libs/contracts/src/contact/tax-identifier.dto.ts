import { TaxIdentifierType } from "./tax-identifier.enum.js";
import { ITaxIdentifier } from "./tax-identifier.interface.js";

export class TaxIdentifierDto implements ITaxIdentifier {
  id: string;
  value: string;
  tenantId?: string;
  contactId?: string;
  type: TaxIdentifierType;
}
