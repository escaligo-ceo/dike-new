import { ApiProperty } from "@nestjs/swagger";
import { OriginDto } from "../app/origin.dto.js";

export class createTeamForTenantsByTenantIdDto extends OriginDto {
  @ApiProperty({
    example: "Studio Rossi",
    description: "Nome del team da creare",
  })
  teamName: string;

  @ApiProperty({
    example: "user-uuid",
    description: "ID dell’utente che crea il team",
  })
  tenantId: string;

  @ApiProperty({
    example: ["user1@email.com", "user2@email.com"],
    description: "Indirizzi email degli utenti da invitare",
    type: [String],
    required: false,
  })
  inviteEmails?: string[];
}

export class CreateTenantByOwnerIdDto extends OriginDto {
  @ApiProperty({
    description: "JWT token dell'utente",
  })
  token: string;

  @ApiProperty({
    example: "user-uuid",
    description: "ID dell’utente proprietario del tenant",
  })
  ownerId: string;

  @ApiProperty({
    example: "Studio Rossi",
    description: "Nome del tenant da creare",
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: "Studio legale specializzato in diritto civile",
    description: "Descrizione del tenant da creare",
    required: false,
  })
  description?: string;
}
