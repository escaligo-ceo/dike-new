import { AppLogger, ImportType, Mapping, Token } from "@dike/common";
import { LoggedUser } from "@dike/communication";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class MappingsService {
  constructor(
    @InjectRepository(Mapping)
    private readonly mappingRepository: Repository<Mapping>,
    private readonly logger: AppLogger
  ) {
    this.logger = new AppLogger(MappingsService.name);
  }

  async findByHash(
    loggedUser: LoggedUser,
    headerHash: string
  ): Promise<Mapping | null> {
    return this.mappingRepository.findOne({ where: { headerHash } });
  }

  async findOrCreate(
    loggedUser: LoggedUser,
    sourceType: ImportType,
    headers: string[],
    headerNormalized: string[],
    headerHash: string,
    headerHashAlgorithm: string
  ): Promise<[Mapping, boolean]> {
    this.logger.log(`findOrCreate called with headers: ${headers}`);
    let mapping = await this.findByHash(loggedUser, headerHash);
    if (mapping === null) {
      this.logger.log(`Creating new mapping for headerHash: ${headerHash}`);
      const mappingEntity = this.mappingRepository.create({
        entityType: sourceType,
        headers,
        headerNormalized,
        headerHash,
        headerHashAlgorithm,
      });
      mapping = await this.mappingRepository.save(mappingEntity);
      this.logger.log(`Mapping created for headerHash: ${headerHash}`);
      return [mapping, true];
    }
    this.logger.log(`Mapping found for headerHash: ${headerHash}`);
    return [mapping, false];
  }

  async updateMapping(
    loggedUser: LoggedUser,
    headerHash: string,
    headers: string[],
    headerNormalized: string[]
  ): Promise<Mapping> {
    const mapping = await this.mappingRepository.findOne({
      where: { headerHash },
    });
    if (!mapping) {
      throw new Error(`Mapping with headerHash ${headerHash} not found`);
    }
    mapping.headers = headers;
    mapping.headerNormalized = headerNormalized;
    return this.mappingRepository.save(mapping);
  }
}
