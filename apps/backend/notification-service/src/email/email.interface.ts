import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from "class-validator";

export class EmailGenericResponse {
  @ApiProperty({
    type: 'boolean',
    description: 'stato di successo'
  })
  @IsBoolean()
  success: boolean;
  
  @ApiProperty({
    type: 'string',
    description: 'messaggio di successo'
  })
  @IsString()
  message: string 
}

export interface EmailTemplate {
  subject: string;
  text: string;
  html: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export interface VerificationEmailOptions {
  to: string;
  link: string;
  username?: string;
}

export interface WelcomeEmailOptions {
  email: string;
  username: string;
  loginLink?: string;
}

export interface PasswordResetEmailOptions {
  email: string;
  resetLink: string;
  username?: string;
}

export interface AlreadyRegisteredEmailOptions {
  to: string;
  originIp?: string;
  originUserAgent?: string;
}

export interface InviteTeamEmailOptions {
  to: string;
  teamName: string;
  inviteLink: string;
}
