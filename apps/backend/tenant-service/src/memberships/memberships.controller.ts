import {
  Analytics,
  AppLogger,
  CurrentUser,
  DikeConfigService,
  Membership,
} from "@dike/common";
import {
  BaseController,
  JwtAuthGuard,
  LoggedUser,
  UserFactory,
} from "@dike/communication";
import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { MembershipsService } from "./memberships.service";

@UseGuards(JwtAuthGuard)
@Controller("memberships")
@ApiTags("memberships")
export class MembershipsController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    private readonly membershipsService: MembershipsService,
    protected readonly userFactory: UserFactory,
  ) {
    super(
      new AppLogger(MembershipsController.name),
      configService,
      userFactory,
    );
  }

  @Get(":userId")
  @Version("1")
  @Analytics()
  @ApiOperation({ summary: "Get memberships for a user" })
  @ApiParam({
    name: "userId",
    description: "ID of the user to get memberships for",
  })
  async getMembershipsByUserId(
    @CurrentUser() loggedUser: LoggedUser,
    @Req() req,
    @Param("userId") queryUserId?: string,
  ): Promise<Membership[]> {
    this.logRequest(req, `getMembershipsByUserId`);
    return this.membershipsService.getMembershipsByUserId(
      loggedUser,
      queryUserId,
    );
  }
}
