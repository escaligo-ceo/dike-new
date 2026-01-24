import { AddressDto } from "@dike/contracts";
import { Address } from "./address.entity.js";

export class AddressMapper {
  static toDto(address: Address): AddressDto {
    return {
      id: address.id,
      tenantId: address.tenantId,
      contactId: address.contactId,
      type: address.type,
      label: address.label,
      street: address.street,
      postalCode: address.postalCode,
      city: address.city,
      state: address.state,
      country: address.country,
      isPreferred: address.isPreferred,
    };
  }

  static toEntity(addressDto: AddressDto): Address {
    const address = new Address();
    address.id = addressDto.id || "";
    address.contactId = addressDto.contactId;
    address.type = addressDto.type;
    address.label = addressDto.label;
    address.street = addressDto.street;
    address.postalCode = addressDto.postalCode;
    address.city = addressDto.city;
    address.state = addressDto.state;
    address.country = addressDto.country;
    address.isPreferred = addressDto.isPreferred;
    return address;
  }
}