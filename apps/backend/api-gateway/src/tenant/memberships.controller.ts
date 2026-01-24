import {
  AppLogger,
  AuthorizationBearer,
  DikeConfigService,
  Membership,
  OriginIp,
  OriginUserAgent,
} from "@dike/common";
import { BaseController, JwtAuthGuard, UserFactory } from "@dike/communication";
import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  Version,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { HttpTenantService } from "../communication/http.tenant.service";

@ApiTags("memberships")
@Controller("memberships")
@UseGuards(JwtAuthGuard)
export class MembershipsController extends BaseController {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    private readonly httpTenantService: HttpTenantService,
    protected readonly userFactory: UserFactory
  ) {
    super(
      new AppLogger(MembershipsController.name),
      configService,
      userFactory
    );
  }

  @Get(":userId")
  @Version("1")
  @ApiOperation({ summary: "Get memberships for a user" })
  async getMembershipsByUserId(
    @OriginIp() originIp: string,
    @OriginUserAgent() originUserAgent: string,
    @AuthorizationBearer() authorization: string,
    @Param("userId") userId: string,
    @Req() req
  ): Promise<Membership[]> {
    this.logRequest(req, `getMembershipsByUserId for userId: ${userId}`);
    const loggedUser = this.userFactory.fromToken(
      req.decodedKeycloakToken,
      originIp,
      originUserAgent,
      authorization
    );
    return this.httpTenantService.getMembershipsByUserId(loggedUser, userId);
  }
}
