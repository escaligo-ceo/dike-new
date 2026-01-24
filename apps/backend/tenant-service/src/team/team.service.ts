import {
  AppLogger,
  EnvNotFoundException,
  Invite,
  Member,
  Role,
  Team,
  Tenant,
  Token,
} from "@dike/common";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Invite)
    private readonly inviteRepository: Repository<Invite>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService
  ) {
    this.logger = new AppLogger(TeamService.name);
  }

  async findTenantById(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { id } });
  }

  get frontendBaseUrl(): string {
    const res = this.configService.get<string>("FRONTEND_URL");
    if (!res) {
      throw new EnvNotFoundException("FRONTEND_URL");
    }
    return res;
  }

  async createTeamAndInvitations(
    tokenDto: Token,
    dto: Partial<Team> & { teamName: string; emails: string[] }
  ): Promise<{ success: boolean; team?: Team }> {
    this.logger.log(`[TeamService] createAndInvite: ${JSON.stringify(dto)}`);
    // 1. Crea il team
    const team = this.teamRepository.create({
      // studioId: undefined,
      name: dto.teamName,
    });
    const savedTeam: Team = await this.teamRepository.save(team)[0];

    return { success: true, team: savedTeam };
  }

  async createInvite(email: string, tenantId: string): Promise<Invite> {
    const tenant = await this.findTenantById(tenantId);
    if (!tenant) throw new Error("Tenant not found");
    const token = Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 giorni
    const invite = this.inviteRepository.create({
      email,
      tenant,
      token,
      // link: `${this.frontendBaseUrl}/invite/${token}`,
      expiresAt,
    });
    await this.inviteRepository.save(invite);
    return invite;
  }

  async findOrCreate(dto: any): Promise<Team> {
    let team = await this.teamRepository.findOne({ where: { id: dto.id } });
    if (!team) {
      const entity = {
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return this.teamRepository.save(entity);
    }
    return team;
  }
}
