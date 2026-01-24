import { ContactDto, YearlyDateTransformer } from "@dike/contracts";
import { Contact } from "./contact.entity.js";
import { EmailMapper } from "./email.mapper.js";
import { TaxIdentifierMapper } from "./tax-identifier.mapper.js";
import { PhoneMapper } from "./phone.mapper.js";
import { AddressMapper } from "./address.mapper.js";
import { WebsiteMapper } from "./website.mapper.js";
import { CompanyMapper } from "./compnay.mapper.js";
import { BirthPlaceTransformer } from "./birth-place.transformer.js";

export class ContactMapper {
  static toDto(contact: Contact): ContactDto {
    return {
      id: contact.id,
      tenantId: contact.tenantId,
      ownerId: contact.ownerId,

      firstName: contact.firstName,
      lastName: contact.lastName,
      middleName: contact.middleName,
      fullName: contact.fullName,
      prefix: contact.prefix,
      suffix: contact.suffix,
      birthday: contact.birthday,
      anniversary: contact.anniversary,
      birthPlace: contact.birthPlace,
      anagraphicSex: contact.anagraphicSex,
      notes: contact.notes,

      company: contact.company !== undefined
        ? CompanyMapper.toDto(contact.company)
        : undefined,

      addresses: contact.addresses?.map(AddressMapper.toDto),
      phones: contact.phones?.map(PhoneMapper.toDto),
      websites: contact.websites?.map(WebsiteMapper.toDto),
      taxIdentifiers: contact.taxIdentifiers?.map(TaxIdentifierMapper.toDto),
      // codiceCatastale: contact.codiceCatastale?.map(CodiceCatastaleMapper.toDto),
      // partitaIva: contact.partitaIva?.map(PartitaIvaMapper.toDto),
      emails: contact.emails?.map(EmailMapper.toDto),
      chats: contact.chats,

      labels: contact.labels,
      photoUrl: contact.photoUrl,
      nickname: contact.nickname,
      // type: contact.type,
      // customType: contact.customType,

      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
      deletedAt: contact.deletedAt,
    };
  }

  static toEntity(contactDto: ContactDto): Contact {
    const contact = new Contact();
    contact.id = contactDto.id || "";
    contact.ownerId = contactDto.ownerId;

    contact.firstName = contactDto.firstName;
    contact.lastName = contactDto.lastName;
    contact.middleName = contactDto.middleName;
    contact.fullName = contactDto.fullName;
    contact.prefix = contactDto.prefix;
    contact.suffix = contactDto.suffix;
    contact.birthday = YearlyDateTransformer.from(contactDto.birthday);
    contact.anniversary = YearlyDateTransformer.from(contactDto.anniversary);
    contact.birthPlace = BirthPlaceTransformer.from(contactDto.birthPlace);
    contact.anagraphicSex = contactDto.anagraphicSex;
    contact.notes = contactDto.notes;

    contact.company = contactDto.company
      ? CompanyMapper.toEntity(contactDto.company)
      : undefined;

    contact.addresses = contactDto.addresses?.map(AddressMapper.toEntity);
    contact.phones = contactDto.phones?.map(PhoneMapper.toEntity);
    contact.websites = contactDto.websites?.map(WebsiteMapper.toEntity);
    contact.taxIdentifiers = contactDto.taxIdentifiers?.map(TaxIdentifierMapper.toEntity);
    // contact.codiceCatastale = contactDto.codiceCatastale?.map(CodiceCatastaleMapper.toEntity);
    // contact.partitaIva = contactDto.partitaIva?.map(PartitaIvaMapper.toEntity);
    contact.emails = contactDto.emails?.map(EmailMapper.toEntity);
    contact.chats = contactDto.chats;

    contact.labels = contactDto.labels;
    contact.photoUrl = contactDto.photoUrl;
    contact.nickname = contactDto.nickname;
    // contact.type = contactDto.type;
    // contact.customType = contactDto.customType;

    return contact;
  }
}
