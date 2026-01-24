import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class GetTenantDto {
  @ApiProperty({
    description: "The ID of the tenant to retrieve",
  })
  @IsString()
  tenantId: string;
}

export class GetTenantByOwnerDto {
  @ApiProperty({
    description: "The ID of the user who owns the tenant",
  })
  @IsString()
  ownerId: string;
}

export class SubscribeDto {
  @ApiProperty({
    description: "The ID of the user who owns the tenant",
  })
  @IsString()
  ownerId: string;

  @ApiProperty({
    description: "The name of the subscription plan",
  })
  @IsString()
  planName: string;
}

export class AddOfficeDto {
  @ApiProperty({
    description: "The ID of the user who owns the tenant",
  })
  @IsString()
  ownerId: string;

  @ApiProperty({
    description: "The name of the office",
  })
  @IsString()
  name: String;
}

export class FindOrCreateTenantDto {
  @ApiProperty({
    description: "tenant owner",
  })
  @IsString()
  ownerId: string;

  @ApiProperty({
    description: "tenant name",
  })
  @IsString()
  name?: string;

  @ApiProperty({
    description: "tenant description",
  })
  @IsString()
  description?: string;
}
