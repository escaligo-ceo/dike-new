import { AppLogger, CurrentUser, DikeConfigService, LoginDto } from "@dike/common";
import {
  Audit,
  AuditAction,
  AuditCategory,
  BaseController,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import { Controller, Post, Query, Version } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { VerifyEmailService } from "./verify-email.service";

@Controller("email")
@ApiTags("Email")
export class VerifyEmailController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
    private readonly verifyEmailService: VerifyEmailService,
  ) {
    super(new AppLogger(VerifyEmailController.name), configService, userFactory);
  }

  @Post("start-verification")
  @Version("1")
  @Audit(AuditCategory.PROCESS, AuditAction.EMAIL_VERIFICATION_START) // Questo gestisce già IP, UA e l'esito (Success/Failure)
  @ApiOperation({ summary: "Avvia il flow di verifica email" })
  async sendVerificationEmail(@CurrentUser() loggedUser: LoggedUser) {
    const loginResult: LoginDto = {
      userId: loggedUser.id,
      email: loggedUser.email,
    };
    return await this.verifyEmailService.start(loginResult);
  }

  @Post("verify")
  @Version("1")
  @Audit(AuditCategory.PROCESS, AuditAction.EMAIL_VERIFICATION)
  @ApiOperation({ summary: "Verifica l'email con il token ricevuto" })
  @ApiQuery({
    name: "token",
    required: true,
    description: "Token di verifica email",
  })
  async verifyEmail(
    @CurrentUser() loggedUser: LoggedUser,
    @Query("token") token: string,
  ) {
    return await this.verifyEmailService.verifyEmailToken(loggedUser, token);
  }
}
