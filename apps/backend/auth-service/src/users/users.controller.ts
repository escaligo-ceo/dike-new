import {
  AppLogger,
  CurrentUser,
  DikeConfigService,
} from "@dike/common";
import {
  Audit,
  AuditAction,
  AuditCategory,
  BaseController,
  IKeycloakUser,
  KeycloakService,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import { Body, Controller, HttpStatus, Post, Req, Version } from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

@ApiTags("users")
@Controller("users")
export class UsersController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    private readonly keycloakService: KeycloakService,
    protected readonly userFactory: UserFactory
  ) {
    super(new AppLogger(UsersController.name), configService, userFactory);
  }

  @Post()
  @Version("1")
  @Audit(AuditCategory.USER, AuditAction.FIND_BY_EMAIL)
  @ApiOperation({
    summary: "Trova utente Keycloak tramite email",
  })
  @ApiBody({
    schema: {
      properties: {
        email: { type: "string", example: "user@example.com" },
      },
      required: ["email"],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Utente trovato",
    type: Object,
  })
  async findUserByEmail(
    @CurrentUser() loggedUser: LoggedUser,
    @Body("email") email: string,
    @Req() req
  ): Promise<IKeycloakUser> {
    this.logRequest(req, `findUserByEmail called for email: ${email}`);
    return this.keycloakService.findUserByEmail(loggedUser.token, email);
  }

  @Post("email-verification")
  @Version("1")
  @Audit(AuditCategory.USER, AuditAction.SAVE_EMAIL_VERIFICATION_TOKEN)
  @ApiOperation({
    summary:
      "Salva token di verifica email per utente per verificarlo successivamente quando l'utente visita il link di verifica",
  })
  @ApiParam({
    name: "userId",
    type: "string",
    example: "uuid-utente",
  })
  async saveEmailVerificationToken(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req
  ): Promise<void> {
    this.logRequest(req, `saveEmailVerificationToken`);

  }
}
