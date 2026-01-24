import { CreateContactFromImportDto } from "./contact-from-import.dto.js";
import { IImportOptions } from "./options.js";

export interface IImportContactsDto {
  tenantId: string;
  ownerId: string;

  items: Array<CreateContactFromImportDto>;
  options: IImportOptions;
}
