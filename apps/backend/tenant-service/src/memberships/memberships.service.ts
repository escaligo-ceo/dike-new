import { AppLogger, Membership, Token, userIdFromToken } from "@dike/common";
import { LoggedUser } from "@dike/communication";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

export class MembershipsService {
  constructor(
    private readonly logger: AppLogger,
    @InjectRepository(Membership)
    public membershipRepository: Repository<Membership>
  ) {
    this.logger = new AppLogger(MembershipsService.name);
  }

  async getMembershipsByUserId(
    loggedUser: LoggedUser,
    userId?: string
  ): Promise<Membership[]> {
    return this.membershipRepository.find({
      where: {
        userId: userId || loggedUser.id,
      },
      relations: ["tenant"],
    });
  }
}
