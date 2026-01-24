import { ApiProperty } from "@nestjs/swagger";
import { IsIP, IsString } from "class-validator";

export class OriginDto {
  @ApiProperty({
    description: `
Indirizzo IP di origine della richiesta.
Viene tipicamente estratto dall'header X-Forwarded-For o dalla connessione diretta.
Serve per tracciare la provenienza della chiamata e per audit di sicurezza.
    `,
    example: "192.168.1.10",
    type: "string",
    format: "ipv4",
  })
  @IsIP()
  @IsString()
  originIp: string;

  @ApiProperty({
    description: `
User-Agent di origine della richiesta.
Viene estratto dall'header User-Agent o X-Forwarded-User-Agent.
Permette di identificare il client, il browser o il sistema che ha generato l'evento.
    `,
    example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  })
  @IsString()
  originUserAgent: string;

  @ApiProperty({
    description: "Authorization header contenente il token JWT Bearer",
    example: "Bearer <token>",
  })
  @IsString()
  authorization?: string;
}
