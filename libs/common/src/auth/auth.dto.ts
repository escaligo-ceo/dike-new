import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class FullAccessTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Keycloak access token" })
  kc_access_token: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Tenant ID" })
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: "Profile ID" })
  profileId: string;
}