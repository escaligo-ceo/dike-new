import { AppLogger, CurrentUser, DikeConfigService } from "@dike/common";
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
import { EmailService } from "./email.service";

@Controller("email")
@ApiTags("Email")
export class EmailController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
    private readonly emailService: EmailService,
  ) {
    super(new AppLogger(EmailController.name), configService, userFactory);
  }

  @Post("start-verification")
  @Version("1")
  @Audit(AuditCategory.PROCESS, AuditAction.EMAIL_VERIFICATION_START) // Questo gestisce già IP, UA e l'esito (Success/Failure)
  @ApiOperation({ summary: "Avvia il flow di verifica email" })
  async sendVerificationEmail(@CurrentUser() loggedUser: LoggedUser) {
    // 1. Il Guard o un Interceptor hanno già validato il token e popolato @CurrentUser
    // 2. Non serve passare IP e UA a mano, il servizio di Audit li prende dal contesto
    // 3. Il servizio di processo (orchestratore) riceve l'utente e decide cosa fare

    return await this.emailService.startEmailVerification(loggedUser);
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
    return await this.emailService.verifyEmailToken(loggedUser, token);
  }
}
