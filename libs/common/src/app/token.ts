import { ApiProperty } from "@nestjs/swagger";
import { IsIP, IsString } from "class-validator";
import { OriginDto } from "./origin.dto.js";
import { userIdFromToken } from "./user-id-from-token.js";
import { inspect } from "./utils.js";
import { AppLogger } from "./logger.js";

export class Token {
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
    description: "user JWT Token",
  })
  @IsString()
  accessToken: string;

  @ApiProperty({
    description: "Refresh Token (when applicable)",
  })
  @IsString()
  refreshToken?: string;

  private _userId: string | undefined;
  private _logger = new AppLogger(Token.name);
  private _emailVerified: boolean | undefined;

  constructor(
    originIp: string,
    originUserAgent: string,
    access_token: string,
    refresh_token?: string,
  ) {
    this.originIp = originIp;
    this.originUserAgent = originUserAgent;
    if (access_token === undefined) {
      throw new Error("Invalid access_token");
    }

    // Always require a valid access token
    this.accessToken = access_token;
    if (refresh_token !== undefined) {
      this.refreshToken = refresh_token;
    } else {
      this._logger.warn("Refresh token not provided");
    }

    this._userId = userIdFromToken(access_token);
    if (!this._userId) {
      console.trace();
      this._logger.error(`userId not found in access_token: ${inspect(access_token)}`);
      throw new Error(`userId not found: ${inspect(access_token)}`);
    }
  }

  toOriginDto(): OriginDto {
    return {
      originIp: this.originIp,
      originUserAgent: this.originUserAgent,
      authorization: this.accessToken,
    };
  }

  get originDto(): OriginDto {
    return this.toOriginDto();
  }

  get userId(): string {
    if (!this._userId) {
      console.trace();
      this._logger.error(`userId not found in token: ${inspect(this.accessToken)}`);
      throw new Error(`userId not found in token: ${inspect(this.accessToken)}`);
    }
    return this._userId!;
  }

  get emailVerified(): boolean | undefined {
    if (!this._emailVerified) {
      console.trace();
      this._logger.error(`email verification status not found in token: ${inspect(this.accessToken)}`);
      throw new Error(`email verification status not found in token: ${inspect(this.accessToken)}`);
    }
    return this._emailVerified!;
  }
}
