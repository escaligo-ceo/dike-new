import {
  AppLogger,
  inspect,
  Invite,
  Member,
  Membership,
  Office,
  OfficeDto,
  Onboarding,
  OnboardingPages,
  Profile,
  Role,
  Team,
  Tenant,
} from "@dike/common";
import {
  ApiGatewayService,
  AuditService,
  LoggedUser,
} from "@dike/communication";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Office)
    private readonly officeRepository: Repository<Office>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Invite)
    private readonly inviteRepository: Repository<Invite>,
    private readonly logger: AppLogger,
    private readonly auditService: AuditService,
    private readonly apiGateway: ApiGatewayService
  ) {
    this.logger = new AppLogger(TenantService.name);
  }

  // async createOffice(loggedUser:LoggedUser, officeData: any): Promise<void> {
  //   this.logger.log("Creating office...", officeData);
  //   const tenant = await this.tenantRepository.findOne(officeData.tenant_id);
  //   if (!tenant) {
  //     throw new Error("Tenant not found");
  //   }
  //   const entity = this.officeRepository.create({
  //     tenant,
  //     name: officeData.name,
  //   });
  //   await this.officeRepository.save(entity);
  //   this.logger.log(`Tenant log written: ${inspect(entity)}`);
  //   return;
  // }

  async getTeamsByTenant(loggedUser: LoggedUser, tenantId: string) {
    return this.teamRepository.find({
      where: { tenant: { id: tenantId } },
      relations: ["members", "roles", "invites"],
    });
  }

  async findOrCreate(
    loggedUser: LoggedUser,
    tenantData: Partial<Tenant>
  ): Promise<[Tenant, boolean]> {
    this.logger.log(
      `[findOrCreate] tenantData: ${inspect(tenantData)}`
    );

    const ownerId = tenantData.ownerId ?? loggedUser.id;

    const tenants: Tenant[] = await this.findByOwnerId(loggedUser, ownerId);
    let tenant: Tenant;

    let profile: Profile | null;
    try {
      profile = await this.apiGateway.getProfileByUserId(loggedUser, ownerId);
    } catch (error) {
      this.logger.error(
        `Error fetching profile for ownerId ${ownerId}: ${inspect(error)}`
      );
      throw error;
    }

    if (!profile || profile === null) {
      const message = `findProfileByUserId: ${ownerId} - Not found`;
      this.logger.error(message);

      // this.auditService.safeLog(
      //   loggedUser,
      //   "PROFILE_BY_USER_ID_NOT_FOUND",
      //   message,
      //   { ownerId }
      // );

      throw new NotFoundException(message);
    }

    if (tenants.length === 0) {
      const entity = this.tenantRepository.create({
        ownerId,
        ...tenantData,
        name: tenantData.name || `Studio di ${profile.fullName}`,
        offices: [],
        memberships: [],
        teams: [],
        invites: [],
      });
      tenant = await this.tenantRepository.save(entity);

      // Create membership relation for owner immediately after tenant creation
      try {
        // Prevent duplicates against UQ (tenant_id, user_id)
        const existing = await this.membershipRepository.findOne({
          where: { tenantId: tenant.id, userId: ownerId },
          relations: ["tenant"],
        });
        if (!existing) {
          const membership = this.membershipRepository.create({
            tenantId: tenant.id,
            userId: ownerId,
            role: "owner",
          });
          await this.membershipRepository.save(membership);
        }
      } catch (err) {
        this.logger.error(
          `Failed to ensure membership for owner ${ownerId} in tenant ${tenant.id}: ${inspect(err)}`
        );
      }

      // this.auditService.safeLog(
      //   loggedUser,
      //   "TENANT_CREATED",
      //   `Tenant created for ownerId: ${ownerId}`,
      //   { tenantId: tenant.id, ownerId }
      // );

      return [tenant, true];
    }
    tenant = tenants[0]; // FIXME: ensure that this is the correct one
    // this.auditService.safeLog(
    //   loggedUser,
    //   "TENANT_RETRIEVED",
    //   `Tenant retrieved for ownerId: ${ownerId}`,
    //   { tenantId: tenant.id, ownerId }
    // );

    return [tenant, false];
  }

  async findByOwnerId(
    loggedUser: LoggedUser,
    ownerId: string
  ): Promise<Tenant[]> {
    return this.tenantRepository.find({ where: { ownerId } });
  }

  async findById(
    loggedUser: LoggedUser,
    tenantId: string
  ): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { id: tenantId } });
  }

  async createTeamForTenant(
    loggedUser: LoggedUser,
    tenantId: string,
    teamName: string
  ): Promise<Team> {
    const entity = {
      tenantId,
      name: teamName,
    };
    const teamInstance = this.teamRepository.create(entity);
    const team: Team = await this.teamRepository.save(teamInstance);

    // this.auditService.safeLog(
    //   loggedUser,
    //   OnboardingPages.TEAM_CREATION,
    //   `Creating team for tenant ${tenantId}`
    // );

    this.logger.log(`Created team for tenant ${tenantId}: ${inspect(team)}`);
    return team;
  }

  async findTenantForUserId(loggedUser: LoggedUser): Promise<Tenant[]> {
    const userId = loggedUser.id;
    const memberships = await this.membershipRepository.find({
      where: { userId },
      relations: ["tenant"], // carica il tenant associato
    });

    return memberships.map((m) => m.tenant);
  }

  async getTenantsByOnwer(loggedUser: LoggedUser): Promise<Tenant[]> {
    const userId = loggedUser.id;
    const tenants = await this.tenantRepository.find({
      where: { ownerId: userId },
      // relations: ["tenant"], // carica il tenant associato
    });

    return tenants;
  }

  async findOrCreateMembershipBetweenTenantAndUser(
    loggedUser: LoggedUser,
    tenantId: string,
    membershipData: { userId: string; role: string }
  ): Promise<[Membership, boolean]> {
    this.logger.log(`[findOrCreateMembershipBetweenTenantAndUser] tenantId: ${tenantId}, userId: ${membershipData.userId}, role: ${membershipData.role}`);

    let membership: Membership | null = await this.membershipRepository.findOne(
      {
        where: {
          tenant: { id: tenantId },
          userId: membershipData.userId,
        },
        relations: ["tenant"],
      }
    );
    if (membership) {
      // this.auditService.safeLog(
      //   loggedUser,
      //   "MEMBERSHIP_RETRIEVED",
      //   `Retrieving membership for tenant ${tenantId} and user ${membershipData.userId}`
      // );

      this.logger.log(
        `Retrieved membership for tenant ${tenantId}: ${inspect(membership)}`
      );

      return [membership, false];
    }
    const entity = {
      tenantId,
      ...membershipData,
    };
    const membershipInstance = this.membershipRepository.create(entity);
    membership = await this.membershipRepository.save(membershipInstance);

    // this.auditService.safeLog(
    //   loggedUser,
    //   OnboardingPages.MEMBERSHIP_CREATION,
    //   `Creating membership for tenant ${tenantId} and user ${membershipData.userId}`
    // );

    this.logger.log(
      `Created membership for tenant ${tenantId}: ${inspect(membership)}`
    );
    return [membership, true];
  }

  async findOrCreateOfficeOnTenant(
    loggedUser: LoggedUser,
    tenantId: string,
    officeData: OfficeDto
  ): Promise<[Office, boolean]> {
    this.logger.log(`[findOrCreateOfficeOnTenant] tenantId: ${tenantId}, officeData: ${inspect(officeData)}`);
    
    // Validazione: il nome è obbligatorio
    if (!officeData.name) {
      throw new BadRequestException("Office name is required");
    }
    
    let office: Office | null = await this.officeRepository.findOne({
      where: {
        tenant: { id: tenantId },
        name: officeData.name,
      },
      relations: ["tenant"],
    });
    if (office) {
      // this.auditService.safeLog(
      //   loggedUser,
      //   OnboardingPages.OFFICE_CREATION,
      //   // "OFFICE_RETRIEVED",
      //   `Retrieving office for tenant ${tenantId} with name ${officeData.name}`
      // );

      this.logger.log(
        `Retrieved office for tenant ${tenantId}: ${inspect(office)}`
      );

      return [office, false];
    }
    const entity = {
      tenantId,
      ...officeData,
    };
    const officeInstance = this.officeRepository.create(entity);
    office = await this.officeRepository.save(officeInstance);

    // this.auditService.safeLog(
    //   loggedUser,
    //   OnboardingStatus.OFFICE_CREATED,
    //   `Creating office for tenant ${tenantId} with name ${officeData.name}`
    // );

    this.logger.log(
      `Created office for tenant ${tenantId}: ${inspect(office)}`
    );
    return [office, true];
  }

  async findTenantById(
    loggedUser: LoggedUser,
    tenantId?: string
  ): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { id: tenantId ?? loggedUser.tenantId },
    });
  }
}
