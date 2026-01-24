import { TaxIdentifierDto } from "@dike/contracts";
import { TaxIdentifier } from "./tax-identifier.entity.js";

export class TaxIdentifierMapper {
  static toDto(taxIdentifier: TaxIdentifier): TaxIdentifierDto {
    return {
      id: taxIdentifier.id,
      value: taxIdentifier.value,
      // tenantId: taxIdentifier.tenantId,
      contactId: taxIdentifier.contactId,
      type: taxIdentifier.type,
    };
  }

  static toEntity(taxIdentifierDto: TaxIdentifierDto): TaxIdentifier {
    const taxIdentifier = new TaxIdentifier();
    taxIdentifier.id = taxIdentifierDto.id;
    taxIdentifier.contactId = taxIdentifierDto.contactId;
    taxIdentifier.value = taxIdentifierDto.value;
    taxIdentifier.type = taxIdentifierDto.type;
    return taxIdentifier;
  }
}