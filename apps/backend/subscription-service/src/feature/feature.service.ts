import { AppLogger, Feature } from "@dike/common";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepo: Repository<Feature>,
    private readonly logger: AppLogger
  ) {
    this.logger = new AppLogger(FeatureService.name);
  }

  async findByPlanKey(planKey: string): Promise<Feature[]> {
    // Join through plan_features -> plans to filter features belonging to a plan with given key
    return (
      this.featureRepo
        .createQueryBuilder("f")
        .innerJoin("plan_features", "pf", "pf.feature_id = f.id")
        .innerJoin("plans", "p", "pf.plan_id = p.id")
        .where("p.key = :planKey", { planKey })
        // only active relations (to IS NULL)
        .andWhere("pf.to IS NULL")
        .getMany()
    );
  }

  async findByKey(key: string) {
    return this.featureRepo.find({ where: { key } });
  }
}
