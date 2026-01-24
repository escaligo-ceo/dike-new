import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class AddTeamDto {
  @ApiProperty({
    description: "Owner Identifier",
  })
  @IsString()
  ownerId: string;

  @ApiProperty({
    description: "Team Name",
  })
  @IsString()
  name: string;
}

export class AddOfficeDto {
  @ApiProperty({
    description: "Owner Identifier",
  })
  @IsString()
  ownerId: string;

  @ApiProperty({
    description: "Office Name",
  })
  @IsString()
  name: string;
}

export class PlanDto {
  @ApiProperty({
    description: "Plan Identifier",
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: "Plan Key",
  })
  @IsString()
  key: string;

  @ApiProperty({
    description: "Plan Name",
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "Plan Features",
  })
  features: string[];

  @ApiProperty({
    description: "Monthly Price in Euro",
  })
  @IsNumber()
  monthlyPrice: number;

  @ApiProperty({
    description: "Yearly Price in Euro",
  })
  @IsNumber()
  yearlyPrice: number;
}
