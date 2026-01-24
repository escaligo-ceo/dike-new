import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SaveEmailVerificationTokenDto {
  @ApiProperty({
    description: "User ID",
    example: "user-123",
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: "Email verification token",
    example: "abcdef123456",
  })
  @IsString()
  verificationToken: string;
}
