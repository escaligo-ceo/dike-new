import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UploadAvatarResult {
  @ApiProperty({
    description: '',
    example: 'Avatar caricato con successo',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: '',
    example: `resized-{file.filename}`,
  })
  @IsString()
  filename: string;

  @ApiProperty({
    description: '',
    example: `/uploads/avatars/resized-{file.filename}`,
  })
  @IsString()
  url: string;
}