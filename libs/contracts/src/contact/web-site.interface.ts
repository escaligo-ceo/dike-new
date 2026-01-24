import { WebsiteType } from "./web-site.enum.js";

export interface IWebsite {
  id?: string;
  tenantId?: string;
  contactId?: string;
  url: string;
  label?: string;
  type?: WebsiteType;
  isPreferred?: boolean;
}
