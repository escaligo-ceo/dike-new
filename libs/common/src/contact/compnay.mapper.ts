import { CompanyDto } from "@dike/contracts";
import { Company } from "./company.entity.js";
import { AddressMapper } from "./address.mapper.js";
import { PhoneMapper } from "./phone.mapper.js";
import { EmailMapper } from "./email.mapper.js";
import { TaxIdentifierMapper } from "./tax-identifier.mapper.js";

export class CompanyMapper {
  static toDto(company: Company): CompanyDto {
    return {
      id: company.id,
      tenantId: company.tenantId,
      contactId: company.contactId,
      name: company.name,
      department: company.department,
      title: company.title,
      // SDICode: company.SDICode,
      // VATCode: company.VATCode,
      // officeLocation: company.officeLocation,
      addresses: company.addresses?.map(AddressMapper.toDto),
      phones: company.phones?.map(PhoneMapper.toDto),
      emails: company.emails?.map(EmailMapper.toDto),
      taxIdentifiers: company.taxIdentifiers?.map(TaxIdentifierMapper.toDto),
    };
  }

  static toEntity(companyDto: CompanyDto): Company {
    const company = new Company();
    company.id = companyDto.id;
    company.contactId = companyDto.contactId;
    company.name = companyDto.name;
    company.department = companyDto.department;
    company.title = companyDto.title;
    // company.SDICode = companyDto.SDICode;
    // company.VATCode = companyDto.VATCode;
    // company.officeLocation = companyDto.officeLocation;
    company.addresses = companyDto.addresses?.map(AddressMapper.toEntity);
    company.phones = companyDto.phones?.map(PhoneMapper.toEntity);
    company.emails = companyDto.emails?.map(EmailMapper.toEntity);
    company.taxIdentifiers = companyDto.taxIdentifiers?.map(TaxIdentifierMapper.toEntity);
    return company;
  }
}