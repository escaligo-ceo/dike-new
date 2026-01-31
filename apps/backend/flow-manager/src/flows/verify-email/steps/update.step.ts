import { AppLogger, EmailVerificationToken } from "@dike/common";
import { IBaseStep } from "@dike/communication";
import { Repository } from "typeorm";

export class UpdateStep implements IBaseStep {
	private readonly logger: AppLogger;

	constructor(
		private readonly _tokenRepository: Repository<EmailVerificationToken>,
	) {
		this.logger = new AppLogger(UpdateStep.name);
	}

	async execute(loggedUser: LoggedUser, data: any): Promise<any> {
		// Logic to update user information after email verification
		return { success: true, message: "User information updated successfully." };
	}
}