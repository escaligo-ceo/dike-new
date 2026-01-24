import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { AuditAction } from "./audit.enum";

export class LogDto {
  @ApiProperty({
    description: `
      Azione o evento audit che si sta registrando.
      Può essere una stringa identificativa come 'LOGIN', 'DATA_UPDATE', ecc.
      Serve per categorizzare e filtrare i log.
    `,
    example: "LOGIN",
  })
  @IsString()
  action: AuditAction;

  @ApiProperty({
    description: "Messaggio descrittivo dell'evento di log.",
    example: "Utente aggiornato con successo",
    required: false,
  })
  @IsString()
  message: string;

  @ApiProperty({
    description:
      "Dati aggiuntivi associati all'evento di log. Può essere qualsiasi oggetto serializzabile.",
    example: { userId: "123", changes: { email: "nuovo@email.com" } },
    required: false,
    type: Object,
    additionalProperties: true,
  })
  @IsOptional()
  data?: any;
}
