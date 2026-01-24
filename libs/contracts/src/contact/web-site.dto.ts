import { WebsiteType } from "./web-site.enum.js";
import { IWebsite } from "./web-site.interface.js";

export class WebsiteDto implements IWebsite {
  id?: string;
  tenantId?: string;
  contactId?: string;
  url: string;
  label?: string;
  type?: WebsiteType;
  isPreferred?: boolean;
}
