import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class AuditStatsDto {
  @ApiProperty({
    description: "Numero totale di eventi di audit registrati nel sistema.",
    example: 1234,
  })
  @IsNumber()
  totalEvents: number;

  @ApiProperty({
    description: "Numero di utenti unici che hanno generato eventi di audit.",
    example: 56,
  })
  @IsNumber()
  uniqueUsers: number;

  @ApiProperty({
    description: "Data e ora dell'ultimo evento di audit registrato.",
    example: "2024-04-27T12:34:56Z",
  })
  @IsString()
  // @IsNullable()
  lastEventAt: string | null;
  // ...altre statistiche
}
