import {
  Analytics,
  AppLogger,
  CurrentUser,
  DikeConfigService,
  inspect,
  Profile,
} from "@dike/common";
import { Audit, AuditAction, AuditCategory, BaseController, LoggedUser, UserFactory } from "@dike/communication";
import {
  FindOrCreateProfileResponse,
  InternalFindOrCreateProfileRequest,
} from "@dike/contracts/src/profile/profile-internal.dto";
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Version,
} from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { ProfileService } from "./profile.service";

@ApiTags("profiles")
@Controller("profiles/internal")
export class ProfileInternalController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    private readonly profileService: ProfileService,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory
  ) {
    super(
      new AppLogger(ProfileInternalController.name),
      configService,
      userFactory
    );
  }
  
  /**
   * Endpoint interno per recuperare o creare un profilo utente, accettando direttamente il payload utente.
  */
 @Post("find-or-create")
 @Version('1')
 @Audit(AuditCategory.PROFILE, AuditAction.CREATE)
 @ApiOperation({
    summary: "[INTERNAL] Recupera o crea un profilo utente (payload diretto)",
  })
  @ApiConsumes("application/json")
  async internalFindOrCreate(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() body: InternalFindOrCreateProfileRequest,
    @Req() req
  ): Promise<FindOrCreateProfileResponse> {
    this.logRequest(req, `[INTERNAL] internalFindOrCreate called with: ${inspect(body.profileData)}`);
    const userId = body.profileData.userId;
    if (!userId) {
      throw new Error("userId is required in profileData");
    }
    return this.profileService.internalFindOrCreate(loggedUser);
  }

  @Get(":userId")
  @Version('1')
  @Analytics()
  @ApiOperation({ summary: "Recupera il profilo utente tramite userId" })
  @ApiConsumes("application/json")
  @ApiParam({
    name: "userId",
    description: "ID dell'utente di cui recuperare il profilo",
  })
  async internalFindByUserId(
    @Param("userId") userId: string,
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req
  ): Promise<Profile | null> {
    this.logRequest(req, `internalFindByUserId: ${userId}`);
    return this.profileService.internalFindByUserId(loggedUser);
  }
}
