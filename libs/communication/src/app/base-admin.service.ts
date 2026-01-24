import { AppLogger, ILoginResult, OriginDto } from "@dike/common";
import { ApiGatewayService } from "../api-gateway.service";
import { UnauthorizedException } from "@nestjs/common";
import { LoggedUser } from "../user/logged-user";

export class BaseAdminService {
  constructor(
    protected readonly logger: AppLogger,
    protected readonly apiGatewayService: ApiGatewayService,
  ) {
    this.logger = new AppLogger(BaseAdminService.name);
  }

  async login(
    originDto: OriginDto,
    body: { username: string; password: string },
  ): Promise<ILoginResult> {
    const res = await this.apiGatewayService.loginAdmin(
      originDto,
      {
        username: body.username,
        password: body.password,
        email: body.username,
      }
    );

    // salvo il token di sessione in una variabile di istanza
    if (!res || !res.access_token) {
      this.logger.warn(
        `Admin login failed for username: ${body.username} from IP: ${originDto.originIp}`
      );
      throw new UnauthorizedException("Invalid admin credentials");
    }

    this.logger.log(
      `Admin login successful for username: ${body.username} from IP: ${originDto.originIp}`
    );

    return res;
  }

  async getDashboard(
    loggedUser: LoggedUser
  ): Promise<void> {
    this.logger.log(`Fetching admin dashboard data`);
    return;
  }
}