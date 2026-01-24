import {
  AppLogger,
  CreateContactFromImportDto,
  IBulkError,
  IBulkResponse,
  IImportOptions,
  ImportSourceType,
  ImportType,
  inspect,
  Mapping,
} from "@dike/common";
import { ApiGatewayService, LoggedUser } from "@dike/communication";
import { Injectable } from "@nestjs/common";
import { MappingsService } from "../mappings/mappings.service";

@Injectable()
export class ImportsService {
  constructor(
    private readonly logger: AppLogger,
    private readonly apiGatewayService: ApiGatewayService,
    private readonly mappingService: MappingsService
  ) {
    this.logger = new AppLogger(ImportsService.name);
  }

  /**
   * Resolves the buffer from the provided file input.
   * @param {any} file - The file to resolve the buffer from
   * @returns {Buffer} The resolved buffer
   */
  private resolveFileBuffer(file: any): Buffer {
    if (!file) {
      throw new Error("File is required");
    }
    if (Buffer.isBuffer(file)) return file;
    if (file.buffer && Buffer.isBuffer(file.buffer)) return file.buffer;
    if (file.data && Array.isArray(file.data)) return Buffer.from(file.data);
    return file as Buffer;
  }

  /**
   * Imports contacts from a multipart request providing file + mapping JSON + type.
   * @param {LoggedUser} loggedUser
   * @param {any} file
   * @param {string | undefined} headerHash
   * @param {ImportType} type
   * @param {IImportOptions} options
   * @returns {Promise<IBulkResponse<CreateContactFromImportDto>[]>} The results of the contact import
   */
  async importsContacts(
    loggedUser: LoggedUser,
    file: any,
    headerHash: string,
    type: ImportType,
    options: IImportOptions = {
      chunkSize: 50,
      dryRun: false,
      continueOnError: true,
    }
  ): Promise<IBulkResponse<CreateContactFromImportDto>> {
    const mappings: Mapping[] = await this.mappingService.findAllByHash(
      loggedUser,
      headerHash
    );

    const mapping: Mapping = mappings[0]; // FIXME: gestire il caso di piu mapping con stesso hash?

    const contacts: CreateContactFromImportDto[] =
      this.parseFile<CreateContactFromImportDto>(
        this.resolveFileBuffer(file),
        type ?? ImportType.CONTACT,
        mapping,
      );

    const chunks = this.chunkArray<CreateContactFromImportDto>(
      contacts,
      options.chunkSize
    );

    const results: IBulkResponse<CreateContactFromImportDto>[] = [];
    const errors: IBulkError<CreateContactFromImportDto>[] = [];
    for (const chunk of chunks) {
      try {
        const created: IBulkResponse<CreateContactFromImportDto> =
          await this.createContactsChunk(loggedUser, chunk);
        results.push(created);
      } catch (error) {
        const err: IBulkError<CreateContactFromImportDto> = {
          index: results.length,
          reason: error.message,
        };
        errors.push(err);
        if (!options.continueOnError) throw error;
        this.logger.error(`Error processing chunk: ${error.message}`);
      }
    }
    return {
      total: results.reduce((sum, res) => sum + (res?.total || 0), 0),
      created: results.reduce((sum, res) => sum + (res?.created || 0), 0),
      failed: results.reduce((sum, res) => sum + (res?.failed || 0), 0),
      errors,
    };
  }

  /**
   * Parses the file and applies the mapping to extract contact data.
   * @param {Buffer} file - The file to parse
   * @param {ImportType} type - The type of import
   * @param {Mapping} mapping - The mapping rules to apply
   * @returns {T[]} The mapped data array
   */
  parseFile<T>(
    file: Buffer,
    type: ImportType,
    mapping: Mapping
  ): T[] {
    this.logger.log(`parseFile: Starting with type: ${type}`);

    // Parse file based on type and apply mapping
    let importSourceType: ImportSourceType;
    switch (type) {
      case ImportType.CONTACT:
        importSourceType = ImportSourceType.CSV;
        break;
      default:
        throw new Error(`Unsupported import type: ${type}`);
    }
    const res: T[] = this.parseFileByType<T>(file, importSourceType, mapping);
    this.logger.log(
      `parseFile: After parseFileByType got ${res.length} raw records`
    );
    return res;
  }

  /**
   * Parses the file based on the specified import source type.
   * @param {Buffer} buffer - The file to parse
   * @param {ImportSourceType} type - The type of the import source
   * @param {Mapping} mapping - The mapping to apply
   * @returns {T[]} The parsed data as an array of objects
   */
  private parseFileByType<T>(buffer: Buffer, type: ImportSourceType, mapping: Mapping): T[] {
    switch (type) {
      case ImportSourceType.CSV:
        return this.parseCSV<T>(buffer, mapping);
      // case ImportSourceType.JSON:
      //   return this.parseJSON(file);
      default:
        throw new Error(`Unsupported file type: ${type}`);
    }
  }

  /**
   * Parses a CSV file and returns the data as an array of objects.
   * @param {Buffer} buffer - The CSV file to parse
   * @param {Mapping} mapping - The mapping to apply
   * @returns {T[]} The parsed rows as an array of objects
   */
  private parseCSV<T>(buffer: Buffer, mapping: Mapping): T[] {
    // CSV parsing logic
    let fileContent: string;

    // // Log file object structure for debugging
    // this.logger.debug(`parseCSV received file type: ${typeof buffer}`);
    // this.logger.debug(`parseCSV file keys: ${Object.keys(buffer).join(", ")}`);
    // this.logger.debug(
    //   `parseCSV file toString: ${Object.prototype.toString.call(buffer)}`
    // );

    // Handle different file formats
    if (Buffer.isBuffer(buffer)) {
      fileContent = buffer.toString("utf-8");
    } else if (typeof buffer === "string") {
      fileContent = buffer;
    } else {
      throw new Error(`Unsupported file type for CSV parsing: ${typeof buffer}`);
    }

    const lines = fileContent.split("\n").filter((line: string) => line.trim());
    this.logger.log(
      `parseCSV: Read ${lines.length} lines from file (including header)`
    );

    const headers = mapping.headerNormalized;
    this.logger.debug(`parseCSV headers: ${headers.join(", ")}`);

    const records: T[] = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      return mapping.apply<T>(row);
    });

    this.logger.log(`parseCSV: Parsed ${records.length} data records`);
    return records;
  }

  /**
   * Parses a CSV file and returns the data as an array of objects, including total row count.
   * @param {any} file - The CSV file to parse
   * @returns {{rawData: any[], totalRows: number}} The parsed data and total row count
   */
  private parseCSVWithStats(
    file: any
  ): { rawData: any[]; totalRows: number } {
    // CSV parsing logic
    let fileContent: string;

    // // Log file object structure for debugging
    // this.logger.debug(`parseCSVWithStats received file type: ${typeof file}`);
    // this.logger.debug(
    //   `parseCSVWithStats file keys: ${Object.keys(file).join(", ")}`
    // );
    // this.logger.debug(
    //   `parseCSVWithStats file toString: ${Object.prototype.toString.call(file)}`
    // );

    // Handle different file formats
    if (Buffer.isBuffer(file)) {
      fileContent = file.toString("utf-8");
    } else if (typeof file === "string") {
      fileContent = file;
    } else if (file?.buffer && Buffer.isBuffer(file.buffer)) {
      fileContent = file.buffer.toString("utf-8");
    } else if (file?.data && Array.isArray(file.data)) {
      fileContent = Buffer.from(file.data).toString("utf-8");
    } else if (file instanceof Uint8Array) {
      fileContent = Buffer.from(file).toString("utf-8");
    } else if (typeof file === "object" && file !== null) {
      // Try to extract content from object properties
      if (file._readableState) {
        // It's a Stream - this shouldn't happen but handle it
        throw new Error("File is a Stream - cannot directly parse CSV");
      }
      // Try JSON.stringify to see structure
      this.logger.debug(
        `parseCSVWithStats file structure: ${JSON.stringify(Object.keys(file))}`
      );
      throw new Error(
        `Unsupported file type for CSV parsing: ${typeof file}. File keys: ${Object.keys(file).join(", ")}`
      );
    } else {
      throw new Error(`Unsupported file type for CSV parsing: ${typeof file}`);
    }

    const lines = fileContent.split("\n").filter((line: string) => line.trim());
    const totalRows = lines.length - 1; // Subtract header row
    this.logger.log(
      `parseCSVWithStats: Read ${lines.length} lines from file (${totalRows} data rows + 1 header)`
    );

    const headers = lines[0].split(",").map((h) => h.trim());
    this.logger.debug(`parseCSVWithStats headers: ${headers.join(", ")}`);

    const records = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      return row;
    });

    this.logger.log(
      `parseCSVWithStats: Parsed ${records.length} data records, total rows: ${totalRows}`
    );
    return { rawData: records, totalRows };
  }

  private parseJSON(file: any): any[] {
    // JSON parsing logic
    throw new Error("JSON parsing not implemented.");
  }

  /**
   * Applies the given mapping to the data array.
   * @param {string[]} data - The data array to be mapped
   * @param {Mapping} mapping - The mapping to apply
   * @returns {T[]} The mapped data array
   */
  private applyMapping<T>(data: string[], mapping: Mapping): T[] {
    // this.logger.debug(`applyMapping: Starting with ${data.length} raw records`);

    const results: T[] = [];

    const items = data
      .map((row) => {
        // build mapped object
        const input: Record<string, any> = {};
        let index = 0;
        for (const column of mapping.headerNormalized) {
          input[column] = row[index];
          index += 1;
        }
        this.logger.debug(`applyMapping: Input record: ${inspect(input)}`);
        const mapped = mapping.apply<T>(input);
        results.push(mapped);
      })
      // Remove null/empty rows
      .filter((v) => v != null);

    this.logger.log(
      `applyMapping: Processed ${data.length} raw records into ${items.length} valid contacts`
    );

    return results;
  }

  /**
   * Returns the input array split into chunks of specified size.
   * @param {T} array - The array to be chunked
   * @param {number} chunkSize - The size of each chunk
   * @returns {T[][]} An array of chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Creates contacts in bulk from a chunk of data.
   * @param {LoggedUser} loggedUser - The user performing the operation
   * @param {CreateContactFromImportDto[]} chunk - The chunk of contact data to create
   * @returns {Promise<IBulkResponse<CreateContactFromImportDto>>} The created contacts
   */
  private async createContactsChunk(
    loggedUser: LoggedUser,
    chunk: CreateContactFromImportDto[]
  ): Promise<IBulkResponse<CreateContactFromImportDto>> {
    this.logger.log(
      `createContactsChunk: Sending ${chunk.length} contacts to API Gateway for user: ${loggedUser.id}`
    );
    const result = await this.apiGatewayService.bulkCreateContacts(
      loggedUser,
      chunk
    );
    this.logger.log(
      `createContactsChunk: Response received - total: ${result.total}, created: ${result.created}, failed: ${result.failed}`
    );
    return result;
  }
}
