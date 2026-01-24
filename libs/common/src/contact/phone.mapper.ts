import { PhoneDto } from "@dike/contracts";
import { Phone } from "./phone.entity.js";

export class PhoneMapper {
  static toDto(phone: Phone): PhoneDto {
    return {
      id: phone.id,
      tenantId: phone.tenantId,
      contactId: phone.contactId,
      number: phone.number,
      type: phone.type,
      label: phone.label,
      isPreferred: phone.isPreferred,
    };
  }

  static toEntity(phoneDto: PhoneDto): Phone {
    const phone = new Phone();
    phone.id = phoneDto.id || "";
    phone.contactId = phoneDto.contactId;
    phone.number = phoneDto.number;
    phone.type = phoneDto.type;
    phone.label = phoneDto.label;
    phone.isPreferred = phoneDto.isPreferred;
    return phone;
  }
}