import { WebsiteDto } from "@dike/contracts";
import { Website } from "./website.entity.js";

export class WebsiteMapper {
  static toDto(website: Website): WebsiteDto {
    return {
      id: website.id,
      tenantId: website.tenantId,
      contactId: website.contactId,
      url: website.url,
      type: website.type,
      label: website.label,
      isPreferred: website.isPreferred,
    };
  }

  static toEntity(websiteDto: WebsiteDto): Website {
    const website = new Website();
    website.id = websiteDto.id || "";
    website.contactId = websiteDto.contactId;
    website.url = websiteDto.url;
    website.type = websiteDto.type;
    website.label = websiteDto.label;
    website.isPreferred = websiteDto.isPreferred;
    return website;
  }
}