import {
  AppLogger,
  Invite,
  Membership,
  Office,
  Team,
  Tenant,
} from "@dike/common";
import { ApiGatewayService, BaseAdminService, LoggedUser } from "@dike/communication";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class AdminService extends BaseAdminService {
  constructor(
    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Membership)
    private readonly tenantMembershipRepository: Repository<Membership>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Invite)
    private readonly inviteRepository: Repository<Invite>,
    protected readonly logger: AppLogger,
    protected readonly apiGatewayService: ApiGatewayService,
  ) {
    super(new AppLogger(AdminService.name), apiGatewayService);
  }

  async getAllTenants(loggedUser: LoggedUser): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }

  async getAllOffices(loggedUser: LoggedUser): Promise<Office[]> {
    return this.officeRepository.find();
  }

  async getAllTenantMemberships(): Promise<Membership[]> {
    return this.tenantMembershipRepository.find();
  }

  async getAllTeams(loggedUser: LoggedUser): Promise<Team[]> {
    return this.teamRepository.find();
  }

  async getAllInvites(loggedUser: LoggedUser): Promise<Invite[]> {
    return this.inviteRepository.find();
  }

  async getDashboard(loggedUser: LoggedUser): Promise<void> {
    // Admin Dashboard logic
  }
}
