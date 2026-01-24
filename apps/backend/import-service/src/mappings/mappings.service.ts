import {
  AppLogger,
  ImportMappingType,
  ImportSourceType,
  ImportType,
  inspect,
  Mapping,
} from "@dike/common";
import {
  AuditService,
  LoggedUser,
} from "@dike/communication";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class MappingsService {
  constructor(
    @InjectRepository(Mapping)
    private readonly mappingRepo: Repository<Mapping>,
    private readonly logger: AppLogger,
    private readonly auditService: AuditService
  ) {
    this.logger = new AppLogger(MappingsService.name);
  }

  async createDefaultMapping(
    loggedUser: LoggedUser,
    data: Partial<Mapping>
  ): Promise<Mapping> {
    this.logger.log("Creating default mappings...");
    const entity = {
      tenantId: loggedUser.tenantId,
      ownerId: loggedUser.id,
      name: "Default Mapping",
      description: "Default CSV mapping",
      rules: {},
      ...data,
    };
    const instance = this.mappingRepo.create(entity);
    const mapping = await this.mappingRepo.save(instance);
    this.auditService.safeLog(
      loggedUser,
      "MAPPING_CREATED",
      mapping.id,
      `Default mapping created with ID ${mapping.id}`
    );
    this.logger.log("Default mappings created successfully.");
    return mapping;
  }

  async findOrCreateMapping(
    loggedUser: LoggedUser,
    {
      // sourceType,
      headers,
      headerNormalized,
      headerHash,
      headerHashAlgorithm,
    }: {
      // sourceType: ImportType;
      headers: string[];
      headerNormalized: string[];
      headerHash: string;
      headerHashAlgorithm: string;
    }
  ): Promise<[Mapping, boolean]> {
    this.logger.log(`Finding or creating mapping with headers: ${inspect(headers)}, headerNormalized: ${inspect(headerNormalized)}`);
    const ownerId = loggedUser.id;
    const tenantId = loggedUser.tenantId;
    const whereClause = {
      where: {
        ownerId,
        tenantId,
        headerHash,
      },
    };
    this.logger.debug(`Finding or creating mappings: ${inspect(whereClause)}`);
    let mapping = await this.mappingRepo.findOne(whereClause);
    let created = false;
    if (!mapping || mapping === null) {
      this.logger.log("No existing mapping found, creating new one...");
      const entity = {
        // sourceType,
        // name: "Auto-created Mapping",
        // description: "Mapping auto-created based on header hash",
        headerHash,
        headers,
        headerNormalized,
        headerHashAlgorithm,
        // mapping: {}, // Default empty rules; in real case, derive from headers
        tenantId,
        ownerId,
        sourceType: ImportSourceType.CSV, // FIXME: hardcoded for now
        entityType: ImportType.CONTACT, // FIXME: hardcoded for now
        mappingType: "path" as ImportMappingType, // FIXME: hardcoded for now
        rules: {}, // Default empty rules; in real case, derive from headers
      };
      const instance = this.mappingRepo.create(entity);
      this.logger.debug(`Saving new mapping: ${inspect(instance)}`);
      try {
        mapping = await this.mappingRepo.save(instance);
      } catch (error) {
        this.logger.error(`Error saving new mapping: ${error}`);
        throw error;
      }
      this.logger.debug(`New mapping saved: ${inspect(mapping)}`);
      created = true;
      this.logger.log("New mapping created successfully.");
    } else {
      this.logger.log("Existing mapping found.");
    }
    this.auditService.safeLog(
      loggedUser,
      created ? "FIND_OR_CREATE_MAPPING" : "MAPPING_RETRIEVED",
      mapping.id,
      created
        ? `Mapping created with ID ${mapping.id}`
        : `Mapping retrieved with ID ${mapping.id}`
    );
    return [mapping, created];
  }

  async findByHash(
    loggedUser: LoggedUser,
    headerHash: string
  ): Promise<Mapping> {
    this.logger.log("Retrieving mapping by hash...");
    const res = await this.mappingRepo.findOne({ where: { headerHash } });
    if (!res || res === null) {
      throw new NotFoundException(
        `Mapping with header hash ${headerHash} not found`
      );
    }
    this.auditService.safeLog(
      loggedUser,
      "MAPPING_RETRIEVED",
      headerHash,
      `Mapping(s) retrieved with header hash ${headerHash}`
    );
    return res;
  }

  async findAllByHash(
    loggedUser: LoggedUser,
    headerHash: string
  ): Promise<Mapping[]> {
    this.logger.log(`Retrieving all mappings with hash: ${headerHash}...`);
    const mappings: Mapping[] = await this.mappingRepo.find({
      where: {
        headerHash,
        tenantId: loggedUser.tenantId,
      },
    });
    this.auditService.safeLog(
      loggedUser,
      "MAPPINGS_RETRIEVED",
      headerHash,
      `${mappings.length} mappings retrieved with header hash ${headerHash}`
    );
    return mappings;
  }

  async updateMappingByHash(
    loggedUser: LoggedUser,
    headerHash: string,
    mapperData: Partial<Mapping>
  ): Promise<Mapping | null> {
    this.logger.log("Updating mapping by hash...");
    const mapping = await this.mappingRepo.findOne({ where: { headerHash } });
    this.auditService.safeLog(
      loggedUser,
      "MAPPING_UPDATED",
      headerHash,
      `Mapping updated with header hash ${headerHash}`
    );
    return mapping
      ? this.mappingRepo.save({ ...mapping, ...mapperData })
      : null;
  }

  async deleteMappingByHash(
    loggedUser: LoggedUser,
    headerHash: string
  ): Promise<void> {
    this.logger.log("Deleting mapping by hash...");
    await this.mappingRepo.delete({ headerHash });
    this.auditService.safeLog(
      loggedUser,
      "MAPPING_DELETED",
      headerHash,
      `Mapping deleted with header hash ${headerHash}`
    );
  }

  async updateMappingRules(
    loggedUser: LoggedUser,
    headerHash: string,
    mappingData: Partial<Mapping>
  ): Promise<Mapping> {
    this.logger.log("Updating mapping rules...");
    const mapping = await this.findByHash(loggedUser, headerHash);
    if (!mapping || mapping === null) {
      throw new NotFoundException(
        `Mapping with header hash ${headerHash} not found`
      );
    }

    /**
     * Saves the updated mapping to the repository.
     * The properties from `mappingData` take precedence and overwrite any matching properties from the existing `mapping` object.
     * @returns Promise resolving to the saved mapping entity with merged properties
     */
    const updated = await this.mappingRepo.save({ ...mapping, ...mappingData });

    this.logger.log("Mapping rules updated successfully.");
    this.auditService.safeLog(
      loggedUser,
      "MAPPING_UPDATED",
      headerHash,
      `Mapping updated with header hash ${headerHash}`
    );
    return updated;
  }

  async validateMapping(
    loggedUser: LoggedUser,
    headerHash: string,
    sampleData: Record<string, any>[]
  ): Promise<boolean> {
    this.logger.log("Validating mapping...");
    const mapping = await this.mappingRepo.findOne({ where: { headerHash } });
    this.auditService.safeLog(
      loggedUser,
      mapping ? "MAPPING_VALIDATED" : "MAPPING_VALIDATION_FAILED",
      headerHash,
      `Mapping validated with header hash ${headerHash}`
    );
    if (!mapping) {
      return false;
    }
    // Implement validation logic here using mapping and sampleData
    return true;
  }

  /**
   * Trim all string values deeply in an object or array
   * @param {string} entity - The object or array to trim
   * @returns {string} - The trimmed object or array
   */
  private trimStringsDeep(entity: any): any {
    return Object.fromEntries(
      Object.entries(entity).map(([key, value]) => {
        if (typeof value === "string") {
          return [key, value.trim()];
        } else if (Array.isArray(value)) {
          return [
            key,
            value.map((v) => (typeof v === "string" ? v.trim() : v)),
          ];
        } else if (typeof value === "object" && value !== null) {
          return [key, this.trimStringsDeep(value)];
        }
        return [key, value];
      })
    );
  }

  /**
   * Lowercase email fields deeply (keys exactly named 'email' or items within 'emails')
   * @param {T} input - The object or array to process
   * @param {string} [keyHint] - Optional hint for the key name
   * @returns {T} - The processed object or array
   */
  private lowercaseEmailsDeep<T>(input: T, keyHint?: string): T {
    if (input === null || input === undefined) return input as T;
    if (typeof input === "string") {
      // Lowercase when hint suggests this is an email
      if (keyHint && keyHint.toLowerCase() === "email") {
        return input.toLowerCase() as unknown as T;
      }
      return input as unknown as T;
    }
    if (Array.isArray(input)) {
      return input.map((v) =>
        this.lowercaseEmailsDeep(v, keyHint)
      ) as unknown as T;
    }
    if (typeof input === "object") {
      const out: any = {};
      for (const [k, v] of Object.entries(input as any)) {
        const hint = k;
        if (hint.toLowerCase() === "emails" && Array.isArray(v)) {
          out[k] = (v as any[]).map((item) =>
            this.lowercaseEmailsDeep(item, "email")
          );
        } else {
          out[k] = this.lowercaseEmailsDeep(v as any, hint);
        }
      }
      return out as T;
    }
    return input as T;
  }

  /**
   * Apply default values for missing or empty fields (shallow merge for now)
   * @param {T} target - The target object to apply defaults to
   * @param {IDefaultsObject} defaults - The defaults object
   * @returns {T} - The object with defaults applied
   */
  private applyDefaults<T extends Record<string, any>>(
    target: T,
    defaults: IDefaultsObject
  ): T {
    const out = { ...target } as any;
    for (const [key, defVal] of Object.entries(defaults || {})) {
      const curVal = out[key];
      const isEmpty =
        curVal === undefined ||
        curVal === null ||
        (typeof curVal === "string" && curVal.trim() === "");
      if (isEmpty) out[key] = defVal;
    }
    return out as T;
  }

  /**
   * Retrieves mapping rules by header hash.
   * @param {LoggedUser} loggedUser - The logged-in user
   * @param {string} headerHash - The header hash to look up
   * @returns {Promise<Record<string, any>>}
   */
  async getMappingRulesByHash(
    loggedUser: LoggedUser,
    headerHash: string
  ): Promise<Record<string, any>> {
    this.logger.log("Retrieving mapping rules by hash...");
    const mapping = await this.mappingRepo.findOne({ where: { headerHash } });
    if (!mapping || mapping === null) {
      throw new NotFoundException(
        `Mapping with header hash ${headerHash} not found`
      );
    }
    this.auditService.safeLog(
      loggedUser,
      "MAPPING_RULES_RETRIEVED",
      headerHash,
      `Mapping rules retrieved with header hash ${headerHash}`
    );
    this.logger.debug(inspect(mapping))
    return mapping.rules || {};
  }
}

// Helper transformations
export interface IDefaultsObject {
  [key: string]: any;
}
