import { AccessAction, AccessResponse, AccessStatus, AccessStep, AccessStepStatus, AppLogger, ILoginResult, LoginUserDto, OriginDto } from "@dike/common";
import { IBaseStep } from "@dike/communication";
import { HttpAuthService } from "../../../communication/http.auth.service";

export class AuthorizeUserStep implements IBaseStep {
	protected readonly logger: AppLogger;

	constructor(
		protected readonly httpAuthService: HttpAuthService,
		private readonly _httpAuthService: HttpAuthService,
	) {
		this.logger = new AppLogger(AuthorizeUserStep.name);
	}

	async execute(originDto: OriginDto, loginUserDto: LoginUserDto): Promise<AccessResponse> {
		const loginResult = await this._httpAuthService.login(
			originDto,
			loginUserDto,
		);

		if (!loginResult.success) {
			return {
				status: AccessStatus.FAILURE,
			};
		}

		return {
			step: AccessStep.EMAIL_VERIFICATION,
			status: loginResult.emailVerified ? AccessStatus.SUCCESS : AccessStatus.PENDING,
			stepStatus: loginResult.emailVerified ? AccessStepStatus.COMPLETED : AccessStepStatus.PENDING,
			nextAction: loginResult.emailVerified ? AccessAction.START_ONBOARDING : AccessAction.VERIFY_EMAIL,
			message: loginResult.emailVerified
				? "Email successfully verified"
				: "Please verify your email to continue.",
			token: {
				type: "LIMITED",
				value: loginResult.access_token,
			},
			context: loginResult.emailVerified ? undefined : { email: loginResult.email },
		};
	}
}
