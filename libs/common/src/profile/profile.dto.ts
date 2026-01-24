import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, IsUrl } from "class-validator";
import { JobRole } from "./job-role.enum.js";
import { Profile } from "./profile.entity.js";

export class FindOrCreateProfileDto {
  @ApiProperty({
    description: "ID univoco dell'utente per cui creare il profilo.",
    example: "user-123",
  })
  @IsString()
  userId?: string;

  @ApiProperty({
    description: "Dati del profilo da creare.",
    type: "object",
    example: {
      firstName: "Mario",
      lastName: "Rossi",
      email: "mario.rossi@example.com",
    },
    additionalProperties: true,
  })
  profileData: Partial<Profile>;
}

export class UpdateProfileDto {
  @ApiProperty({
    description:
      "Dati da aggiornare per il profilo utente. Solo i campi specificati verranno modificati.",
    type: "object",
    example: {
      firstName: "Mario",
      lastName: "Rossi",
      email: "mario.rossi@example.com",
    },
    additionalProperties: true,
  })
  profileData: Partial<Profile>;
}

export class FindUserByEmailDto {
  @ApiProperty({
    description: "Email dell'utente da cercare",
  })
  @IsString()
  email: string;
}

export class BaseVerificationLinkDto {
  @ApiProperty({
    description: "Token di verifica",
  })
  @IsString()
  verificationToken: string;
}

export class SaveVerificationTokenDto extends BaseVerificationLinkDto {
  @ApiProperty({
    description: "ID dell'utente a cui associare il token di verifica email",
  })
  @IsString()
  userId: string;
}

export class VerificationLinkDto extends BaseVerificationLinkDto {
  @ApiProperty({
    description: "Email dell'utente da verificare",
  })
  @IsString()
  email: string;
}

export class UpdateUserProfileDto {
  // @ApiProperty({
  //   description: 'The display name of the user',
  //   example: 'John Doe',
  // })
  // @IsString()
  // displayName!: string;

  @ApiProperty({
    description: "The URL of the user's avatar image",
    example: "https://example.com/avatar.jpg",
  })
  @IsString()
  @IsUrl()
  avatarUrl!: string;

  /**
   * Codice numerico del ruolo professionale (vedi enum JobRole).
   */
  @ApiProperty({
    description: "Codice numerico del ruolo professionale (vedi enum JobRole)",
    required: false,
    enum: JobRole,
    example: 0,
  })
  @IsOptional()
  jobRole?: number;

  /**
   * Etichetta/descrizione del ruolo professionale. Obbligatoria se jobRole è CUSTOM (4).
   */
  @ApiProperty({
    description:
      "Etichetta/descrizione del ruolo professionale. Obbligatoria se jobRole è CUSTOM (4).",
    required: false,
    example: "Lawyer",
  })
  @IsOptional()
  @IsString()
  jobRoleText?: string;

  @ApiProperty({
    description: "The URL of the user's background image",
    example: "https://example.com/background.jpg",
  })
  @IsString()
  @IsUrl()
  backgroundUrl!: string;

  @ApiProperty({
    description: "The URL of the user's landing page",
    example: "/onboarding/user",
  })
  @IsString()
  @IsUrl()
  defaultRedirectUrl!: string;

  @ApiProperty({
    description: "The first name of the user",
    example: "John",
  })
  @IsString()
  firstName!: string;

  @ApiProperty({
    description: "The last name of the user",
    example: "Doe",
  })
  @IsString()
  lastName!: string;

  @ApiProperty({
    description: "The full name of the user",
    example: "John Doe",
  })
  @IsString()
  fullName!: string;

  @ApiProperty({
    description: "The email address of the user",
    example: "",
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: "The phone number of the user",
    example: "1234567890",
  })
  @IsString()
  phoneNumber!: string;

  @ApiProperty({
    description: "The VAT number of the user",
    example: "IT12345678901",
  })
  @IsString()
  piva!: string;

  @ApiProperty({
    description: "The bio or description of the user",
    example: "Software developer with a passion for open source.",
  })
  @IsString()
  bio!: string;
}

export class CreateUserProfileDto extends UpdateUserProfileDto {
  @ApiProperty({
    description: "The unique identifier of the user",
    example: "1234567890",
  })
  @IsString()
  userId!: string;
}

export class UpdateBaseProfile {
  @ApiProperty({
    description: "URL avatar utente",
    required: false,
    example: "https://example.com/avatar.jpg",
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({
    description: "URL immagine di sfondo",
    required: false,
    example: "https://example.com/background.jpg",
  })
  @IsOptional()
  @IsString()
  backgroundUrl?: string;

  @ApiProperty({ description: "Nome", required: false, example: "Mario" })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: "Cognome", required: false, example: "Rossi" })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: "Nome completo",
    required: false,
    example: "Mario Rossi",
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    description: "Email",
    required: false,
    example: "mario.rossi@example.com",
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: "Telefono",
    required: false,
    example: "3331234567",
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: "Partita IVA",
    required: false,
    example: "IT12345678901",
  })
  @IsOptional()
  @IsString()
  piva?: string;

  @ApiProperty({
    description: "Bio o descrizione",
    required: false,
    example: "Sviluppatore software.",
  })
  @IsOptional()
  @IsString()
  bio?: string;
}

export class UpdateProfileByUserIdDto extends UpdateBaseProfile {
  @ApiProperty({
    description: "ID dell'utente",
    example: "user-123",
  })
  @IsString()
  userId: string;
}
