import {
  AppLogger,
  BaseUrl,
  CreateContactFromImportDto,
  DikeConfigService,
  generateHeadersHash,
  IBulkResponse,
  IImportOptions,
  ImportType,
  inspect,
  Mapping,
  OriginDto,
} from "@dike/common";
import { AuditService, BaseHttpService, LoggedUser } from "@dike/communication";
import { HttpService } from "@nestjs/axios";
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import axios from "axios";
import FormData from "form-data";

@Injectable()
export class HttpImportService extends BaseHttpService {
  private readonly frontendServiceParams: BaseUrl;

  constructor(
    protected readonly httpService: HttpService,
    protected readonly logger: AppLogger,
    protected readonly configService: DikeConfigService,
    protected readonly auditService: AuditService
  ) {
    super(
      httpService,
      new AppLogger(HttpImportService.name),
      configService,
      configService.env("IMPORT_SERVICE_URL", "http://localhost:8007/api")
    );

    const frontendServiceUrl = this.configService.env(
      "FRONTEND_URL",
      "http://localhost:5172"
    );
    this.frontendServiceParams = new BaseUrl(frontendServiceUrl);
  }

  public get frontendBaseUrl(): string {
    return this.frontendServiceParams.baseUrl();
  }

  async mappingFindOrCreate(
    loggedUser: LoggedUser,
    headers: string[],
    headerHash: string,
    options: IImportOptions
  ): Promise<boolean> {
    const requestUrl = `/v1/mappings/validate-header`;
    try {
      const response = await this.post(
        requestUrl,
        { headers, headerHash, options },
        loggedUser.token.originDto
      );
      return response.data.isValid;
    } catch (error) {
      let errorMessage = `Failed to validate contact header`;
      if (axios.isAxiosError(error) && error.response) {
        this.auditService.safeLog(
          loggedUser,
          "MAPPING_UPDATE_FAILURE",
          errorMessage,
          {
            headers,
            headerHash,
            options,
          });
        this.logger.error(errorMessage, error);
        console.trace();
        throw new HttpException(error.response.data, error.response.status);
      }
      errorMessage += " without error or response";

      this.auditService.safeLog(
        loggedUser,
        "MAPPING_UPDATE_FAILURE",
        errorMessage,
        {
          headers,
          headerHash,
          options,
        }
      );
      this.logger.error(errorMessage, error);
      console.trace();
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async findMappingsByHash(
    loggedUser: LoggedUser,
    headerHash: string
  ): Promise<Mapping | null> {
    const requestUrl = `/v1/mappings/${headerHash}`;
    const origin = loggedUser.token.toOriginDto();
    try {
      const response = await this.get(requestUrl, origin);
      return response.data;
    } catch (error) {
      let errorMessage = `Failed to find mapping by hash: ${headerHash}`;
      this.logger.error("Failed to find mapping by hash", error);
      if (axios.isAxiosError(error) && error.response) {
        console.trace();
        this.auditService.safeLog(
          loggedUser,
          "MAPPING_FIND_OR_CREATE_FAILURE",
          errorMessage,
          {
            headerHash,
          }
        );
        throw new HttpException(error.response.data, error.response.status);
      }
      errorMessage += " without error or response";

      this.auditService
        .safeLog(loggedUser, "MAPPING_FIND_OR_CREATE_FAILURE", errorMessage, {
          headerHash,
        });

      this.logger.error(errorMessage, error);
      console.trace();
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async findAllMappingsByHash(
    loggedUser: LoggedUser,
    headerHash: string
  ): Promise<Mapping[]> {
    const requestUrl = `/v1/mappings/${headerHash}`;
    const origin = loggedUser.token.toOriginDto();
    try {
      const response = await this.get(requestUrl, origin);
      return response.data;
    } catch (error) {
      let errorMessage = `Failed to find all mappings by hash: ${headerHash}`;
      this.logger.error("Failed to find all mappings by hash", error);
      if (axios.isAxiosError(error) && error.response) {
        console.trace();
        this.auditService
          .safeLog(loggedUser, "MAPPING_FIND_FAILURE", errorMessage, {
            headerHash,
          })
          .catch((err) =>
            this.logger.error(`Audit log failed: ${inspect(err)}`)
          );
        throw new HttpException(error.response.data, error.response.status);
      }
      errorMessage += " without error or response";

      this.auditService
        .safeLog(loggedUser, "MAPPING_FIND_FAILURE", errorMessage, {
          headerHash,
        })
        .catch((err) => this.logger.error(`Audit log failed: ${inspect(err)}`));

      this.logger.error(errorMessage, error);
      console.trace();
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async findOrCreateMapping(
    loggedUser: LoggedUser,
    sourceType: ImportType,
    headers: string[],
    headerNormalized: string[],
    headerHash: string,
    headerHashAlgorithm: string
  ): Promise<[Mapping, boolean]> {
    const requestUrl = `/v1/mappings/find-or-create`;
    try {
      // check hash integrity before processing it
      const recalculatedHeaderHash =
        await generateHeadersHash(headerNormalized);
      if (recalculatedHeaderHash !== headerHash) {
        this.logger.warn(
          `Header hash mismatch: provided ${headerHash}, recalculated ${recalculatedHeaderHash}`
        );
        throw new BadRequestException(
          "Header hash does not match the provided headers"
        );
      }

      const response = await this.post(
        requestUrl,
        {
          sourceType,
          headers,
          headerNormalized,
          headerHash,
          headerHashAlgorithm,
        },
        loggedUser.token.originDto
      );
      return response.data;
    } catch (error) {
      let errorMessage = `Failed to find or create mapping for headerHash: ${headerHash}`;
      // Preserve Nest HttpExceptions (e.g., BadRequestException from hash mismatch)
      if (error instanceof HttpException) {
        this.logger.error(errorMessage, error);
        throw error;
      }
      if (axios.isAxiosError(error) && error.response) {
        this.auditService
          .safeLog(
            loggedUser,
            "MAPPING_FIND_OR_CREATE_FAILURE",
            errorMessage,
            {
              sourceType,
              headers,
              headerNormalized,
              headerHash,
              headerHashAlgorithm,
            }
          )
          .catch((err) =>
            this.logger.error(`Audit log failed: ${inspect(err)}`)
          );

        this.logger.error(errorMessage, error);
        console.trace();
        throw new HttpException(error.response.data, error.response.status);
      }
      errorMessage += " without error or response";
      this.auditService.safeLog(
        loggedUser,
        "MAPPING_FIND_OR_CREATE_FAILURE",
        errorMessage,
        {
          sourceType,
          headers,
          headerNormalized,
          headerHash,
          headerHashAlgorithm,
        }
      );

      this.logger.error(errorMessage, error);
      console.trace();
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async findOrCreateContactMapping(
    loggedUser: LoggedUser,
    headers: string[],
    headerNormalized: string[],
    headerHash: string,
    headerHashAlgorithm: string
  ): Promise<[Mapping, boolean]> {
    return this.findOrCreateMapping(
      loggedUser,
      ImportType.CONTACT,
      headers,
      headerNormalized,
      headerHash,
      headerHashAlgorithm
    );
  }

  async calculateHeaderHash(
    loggedUser: LoggedUser,
    headerNormalized: string[]
  ): Promise<string> {
    return generateHeadersHash(headerNormalized);
  }

  async updateMapping(
    loggedUser: LoggedUser,
    headerHash: string,
    mappingData: Partial<Mapping>
  ): Promise<Mapping> {
    const requestUrl = `/v1/mappings/${headerHash}`;
    try {
      const response = await this.put(
        requestUrl,
        mappingData,
        loggedUser.token.originDto
      );
      return response.data;
    } catch (error) {
      let errorMessage = `Failed to update mapping for headerHash: ${headerHash}`;
      if (axios.isAxiosError(error) && error.response) {
        this.auditService.safeLog(
          loggedUser,
          "MAPPING_UPDATE_FAILURE",
          errorMessage,
          {
            headerHash,
            mappingData,
          }
        );

        this.logger.error(errorMessage, error);
        console.trace();
        throw new HttpException(error.response.data, error.response.status);
      }
      errorMessage += " without error or response";
      this.auditService.safeLog(
        loggedUser,
        "MAPPING_UPDATE_FAILURE",
        errorMessage,
        {
          headerHash,
          mappingData,
        }
      );
      this.logger.error(errorMessage, error);
      console.trace();
      throw new InternalServerErrorException(errorMessage);
    }
  }

  async updateContactMapping(
    loggedUser: LoggedUser,
    headerHash: string,
    mappingData: Partial<Mapping>
  ): Promise<Mapping> {
    return this.updateMapping(loggedUser, headerHash, {
      entityType: ImportType.CONTACT,
      ...mappingData,
    });
  }

  /**
   * Import contacts using multipart/form-data
   * @param {LoggedUser} loggedUser - logged in user
   * @param {Buffer} file - buffer of the uploaded file
   * @param {string} headerHash - hash of the headers
   * @param {ImportType} type - type of import
   * @returns {Promise<IBulkResponse<CreateContactFromImportDto>>} - response from the import operation
   */
  async importsContacts(
    loggedUser: LoggedUser,
    file: any,
    headerHash: string,
    type: ImportType
  ): Promise<IBulkResponse<CreateContactFromImportDto>> {
    const requestUrl = `/v1/imports/contacts`;
    const formData = new FormData();
    // Crea FormData usando la libreria form-data di Node.js
    if (file && file.buffer) {
      formData.append("file", file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype || "application/octet-stream",
      });
    } else if (file) {
      formData.append("file", file);
    }
    formData.append("headerHash", headerHash);
    formData.append("type", type);
    const response = await this.post(
      requestUrl,
      formData,
      loggedUser.token.originDto,
      { "Content-Type": "multipart/form-data" }
    );
    return response.data;
  }

  /**
   * Update mapping rules
   * @param {LoggedUser} loggedUser
   * @param {Record<string, Mapping[]>} rules
   * @returns {Promise<Mapping>}
   */
  async updateMappingRules(
    loggedUser: LoggedUser,
    headerHash: string,
    mappingData: Partial<Mapping>
  ): Promise<Mapping> {
    const requestUrl = `/v1/mappings/${headerHash}/rules`;
    const response = await this.patch(
      requestUrl,
      mappingData,
      loggedUser.token.originDto
    );
    return response.data;
  }

  /**
   * Retrieve mapping rules by header hash
   * @param {LoggedUser} loggedUser - logged in user
   * @param {string} headerHash - mapping header hash
   * @returns {Promise<Record<string, any>>} - mapping rules
   */
  async getMappingRulesByHash(
    loggedUser: LoggedUser,
    headerHash: string
  ): Promise<Record<string, any>> {
    const requestUrl = `/v1/mappings/${headerHash}/rules`;
    const response = await this.get(requestUrl, loggedUser.token.originDto);
    return response.data;
  }

  async importContacts(
    loggedUser: LoggedUser,
    importedContacts: any[]
  ): Promise<IBulkResponse<CreateContactFromImportDto>> {
    const url = `/v1/contacts/import`;
    const response = await this.post(
      url,
      { items: importedContacts },
      loggedUser.token.originDto
    );
    return response.data;
  }
}
