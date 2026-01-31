import {
  Analytics,
  AppLogger,
  CurrentUser,
  DikeConfigService,
  Profile,
  profileTableName,
} from "@dike/common";
import {
  Audit,
  AuditAction,
  AuditCategory,
  BaseController,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import {
  FindOrCreateProfileRequest,
  FindOrCreateProfileResponse,
} from "@dike/contracts";
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Version,
} from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { HttpProfileService } from "../../communication/http.profile.service";

@Controller(profileTableName)
export class UserCreateController extends BaseController {
  constructor(
    private readonly httpProfileService: HttpProfileService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly userFactory: UserFactory,
  ) {
    super(new AppLogger(UserCreateController.name), configService, userFactory);
  }

  @Post("find-or-create")
  @Version("1")
  @Audit(AuditCategory.PROFILE, AuditAction.CREATE)
  @ApiConsumes("application/json")
  async findOrCreateProfile(
    @CurrentUser() loggedUser: LoggedUser,
    @Body() body: FindOrCreateProfileRequest,
    @Req() req,
  ): Promise<FindOrCreateProfileResponse> {
    this.logRequest(req, `findOrCreateProfile`);
    const { userId } = body.profileData;
    if (!userId) {
      throw new Error("userId is required in profileData");
    }
    return this.httpProfileService.internalFindOrCreateProfile(
      loggedUser.token.originDto,
      body,
    );
  }

  @Get(":userId")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Recupera il profilo utente per userId" })
  @ApiResponse({
    description: "Profilo utente recuperato con successo",
  })
  @ApiConsumes("application/json")
  async getProfileByUserId(
    @CurrentUser() loggedUser: LoggedUser,
    @Param("userId") userId: string,
    @Req() req,
  ): Promise<Profile> {
    this.logRequest(req, `getProfileByUserId: ${userId}`);
    return this.httpProfileService.internalGetProfileByUserId(
      loggedUser.token.originDto,
      userId,
    );
  }
}
