import { AppLogger, EmailVerificationToken } from "@dike/common";
import { IBaseStep } from "@dike/communication";
import { Repository } from "typeorm";

export class ValidateStep implements IBaseStep {
	private readonly logger: AppLogger;

	constructor(
		private readonly _tokenRepository: Repository<EmailVerificationToken>,
	) {
		this.logger = new AppLogger(ValidateStep.name);
	}

	async execute(context: any): Promise<any> {
		// Logic to validate the email verification token
		return { valid: true, message: "Email verification token is valid." };
	}
}