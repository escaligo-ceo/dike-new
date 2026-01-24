import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { Contact } from "./contact.entity.js";

export const CONTACTS_AUTOCOMPLETE_DEFAULT_LIMIT = 6;
export const CONTACTS_AUTOCOMPLETE_MAX_LIMIT = 10;

export class AutocompleteContactsDto {
  @IsString()
  @IsNotEmpty()
  query: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(CONTACTS_AUTOCOMPLETE_MAX_LIMIT) // ← limite HARD
  limit?: number;
}

// contact-autocomplete.dto.ts
export class ContactAutocompleteDto {
  id?: string;
  displayName?: string;
  avatarUrl?: string;
  email?: string;
  color?: string;

  constructor(partial: Partial<Contact>) {
    this.id = partial.id;
    this.displayName = partial.fullNameCalculated;
    // Se l'avatar è il path relativo ./contacts/{id}/avatar, conserviamo il path relativo
    // Il frontend saprà come gestirlo
    this.avatarUrl = partial.avatarUrl;
    this.email = partial.preferredEmail;
    this.color = partial.color;
  }
}
