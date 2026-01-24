import { EmailDto } from "@dike/contracts";
import { Email } from "./email.entity.js";

export class EmailMapper {
  static toDto(email: Email): EmailDto {
    return {
      id: email.id,
      tenantId: email.tenantId,
      contactId: email.contactId,
      email: email.email,
      type: email.type,
      label: email.label,
      isPreferred: email.isPreferred,
    };
  }

  static toEntity(emailDto: EmailDto): Email {
    const email = new Email();
    email.id = emailDto.id;
    email.contactId = emailDto.contactId;
    email.email = emailDto.email;
    email.type = emailDto.type;
    email.label = emailDto.label;
    email.isPreferred = emailDto.isPreferred;
    return email;
  }
}