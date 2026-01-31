import { IsDate, IsNotEmpty, IsString, ValidateIf } from "class-validator";

export class EmailVerificationTokenDto {
	@IsString()
	id: string;

	@IsString()
	userId: string;

	@IsString()
	email: string;

	@IsString()
	token: string;

	@ValidateIf(t => {
		const now = new Date();
		return t.expiresAt !== null && t.used !== null && t.expiresAt > now && !t.used;
  })
	@IsDate()
	expiresAt: Date;

	@IsString()
	ip: string;

	@IsString()
	userAgent: string;

	@IsNotEmpty()
	used: boolean;

	@IsString()
	hashedToken: string;

	@IsDate()
	revokedAt?: Date;
}