import { IAddress } from "./address.interface.js";
import { IBirthPlace } from "./birth-place.interface.js";
import { IChat } from "./chat.interface.js";
import { ICompany } from "./company.interface.js";
import { IEmail } from "./email.interface.js";
import { IPhone } from "./phone.interface.js";
import { ITaxIdentifier } from "./tax-identifier.interface.js";
import { IWebsite } from "./www.interface.js";
import { AnagraphicSex } from "./anagraphic-sex.enum.js";

export interface IContact {
  id?: string;
  ownerId?: string;

  firstName?: string;
  lastName?: string;
  fullName?: string;
  prefix?: string;
  middleName?: string;
  phoneticLastName?: string;
  phoneticFirstName?: string;
  suffix?: string;
  nickname?: string;
  photoUrl?: string;
  anagraphicSex?: AnagraphicSex;
  birthPlace?: IBirthPlace;
  birthday?: {
    day: number;
    month: number;
    year?: number;
  };
  anniversary?: {
    day: number;
    month: number;
    year?: number;
  };
  notes?: string;
  labels?: string[];

  company?: ICompany;
  addresses?: Array<IAddress>;
  phones?: Array<IPhone>;
  emails?: Array<IEmail>;
  chats?: Array<IChat>;
  websites?: Array<IWebsite>;
  taxIdentifiers?: Array<ITaxIdentifier>;

  preferredEmail?: string;
  preferredPhone?: string;
  preferredAddress?: string;
  preferredWebsite?: string;
  personalWebPage?: string;

  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
