import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, ValidateIf } from "class-validator";
import { ILoginResult } from "./access.interface.js";

export class KeycloakUserDto {
  @ApiProperty({
    description:
      "The password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    required: true,
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: "Email address of the user",
    required: true,
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: "Username of the user",
    required: false,
  })
  @IsString()
  username?: string;
}

export class LoginUserDto {
  @ApiProperty({ required: false })
  @IsString()
  email?: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  username?: string;

  @ValidateIf(o => !o.email && !o.username)
  @IsNotEmpty({
    message: 'email o username devono essere presenti',
  })
  identifierCheck?: string;
}

export class LoginDto {
  constructor(data: ILoginResult) {
    if (!data || !data.userId) {
      throw new Error('User ID is required.');
    }
    if (!data.email) {
      throw new Error('Email is required.');
    }
    
    this.userId = data.userId;
    this.email = data.email;
  }

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  username?: string;
}

