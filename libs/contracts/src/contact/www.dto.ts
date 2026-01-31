import { WebsiteType } from "./www.enum.js";
import { IWebsite } from "./www.interface.js";

export class WebsiteDto implements IWebsite {
  id?: string;
  tenantId?: string;
  contactId?: string;
  url: string;
  label?: string;
  type?: WebsiteType;
  isPreferred?: boolean;
}
