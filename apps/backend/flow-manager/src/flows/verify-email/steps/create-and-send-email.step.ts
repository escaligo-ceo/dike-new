import { IBaseStep } from "@dike/communication";
import { HttpNotificationService } from "../../../communication/http.notification.service";
import { AppLogger, DikeConfigService, EmailVerificationToken, LoginDto, OriginDto } from "@dike/common";
import { Repository } from "typeorm";
import { VerifyEmailService } from "../verify-email.service";

export class CreateAndSendEmailStep implements IBaseStep {
	private readonly logger: AppLogger;

	constructor(
		private readonly _httpNotificationService: HttpNotificationService,
		private readonly _verifyEmailService: VerifyEmailService,
	) {
		this.logger = new AppLogger(CreateAndSendEmailStep.name);
	}

	async execute(originDto: OriginDto, loginDto: LoginDto): Promise<any> {
		const entity: EmailVerificationToken = await this._verifyEmailService.createEmailVerificationToken(originDto, loginDto);

		if (entity === null) {
			this.logger.error(`Failed to create email verification token for user ID ${loginDto.userId}`);
			throw new Error("Failed to create email verification token");
		}
		const dto = entity.toDto();
		
		await this._httpNotificationService.sendEmailVerification(originDto, {
			to: loginDto.email,
			token: dto.token,
		});

		this.logger.log(`Verification email sent to ${loginDto.email} for user ID ${loginDto.userId}`);
		// Logic to create and send verification email
		return loginDto;
	}
}