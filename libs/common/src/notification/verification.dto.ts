import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class VerificationDto {
  @ApiProperty({
    type: "string",
    format: "email",
    description: "Email del destinatario",
  })
  @IsString()
  email: string;

  @ApiProperty({
    type: "string",
    description: "Link di verifica",
  })
  @IsString()
  verificationLink: string;

  @ApiProperty({
    description: "Nome utente",
    required: false,
    type: "string",
  })
  @IsString()
  username?: string;
}

export class SendMailDto {
  @ApiProperty({
    description: "Indirizzo email del destinatario",
  })
  @IsString()
  to: string;

  @ApiProperty({
    description: "Oggetto dell'email",
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: "Corpo dell'email",
  })
  @IsString()
  body: string;
}

export class SendVerificationLinkDto {
  @ApiProperty({
    description: "Indirizzo email del destinatario",
  })
  @IsString()
  to: string;

  @ApiProperty({
    description: "Link di verifica",
  })
  @IsString()
  link?: string;
}

export class VerifyEmailTokenDto {
  @ApiProperty({
    description: "Indirizzo email del destinatario",
  })
  @IsString()
  to: string;

  @ApiProperty({
    description: "Token di verifica",
  })
  @IsString()
  verificationLink: string;
}

export class CreateTeamForTenantDto {
  @ApiProperty({
    description: "Nome del team",
  })
  @IsString()
  teamName: string;

  @ApiProperty({
    description: "Email degli invitati",
  })
  @IsString({ each: true })
  inviteEmails: string[];
}

export class GetProfileDto {
  @ApiProperty({
    description: "ID utente",
  })
  userId: string;
}
