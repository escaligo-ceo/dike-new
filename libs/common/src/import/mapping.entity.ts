import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { applyMapping } from "./mapping-engine.js";

export enum ImportType {
  CONTACT = "contact",
  // EVENT = "event",
  // PRACTICE = "practice",
}

export enum ImportSourceType {
  CSV = "csv",
  JSON = "json",
  XML = "xml",
  VCF = "vcf",
}

export enum ImportMappingType {
  PATH = "path", // address[0].street -> addresses[0].street
  JSONATA = "jsonata", // mapping avanzato
}

export const mappingsTableName = "mappings";

@Entity(mappingsTableName)
@Index(["tenantId", "entityType"])
export class Mapping {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "uuid" })
  tenantId!: string;

  @Column({ type: "uuid", name: "owner_id" })
  ownerId!: string;

  @Column({
    type: "enum",
    enum: ImportType,
  })
  entityType!: ImportType;

  @Column({
    type: "varchar",
    length: 50,
    comment: "Source system type, e.g., csv, json, vcf, etc.",
  }) // example: "csv, json, vcf, etc."
  sourceType: string;

  @Column({ length: 150 })
  name?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @ApiProperty({ default: 1, description: "Versione logica del mapping" })
  @Column({ type: "int", default: 1 })
  version!: number;

  @Column("text", {
    array: true,
    comment: "Original headers from the source file",
  })
  headers!: string[];

  @Column("text", { array: true, comment: "Normalized headers" })
  headerNormalized!: string[];

  @Column({ name: 'header_hash', length: 128, comment: "Hash of the original headers" })
  headerHash!: string;

  @Column({ name: 'header_hash_algorithm', length: 50, comment: "Algorithm used for hashing the headers" })
  headerHashAlgorithm!: string;

  @Column({
    name: "mapping_type",
    type: "enum",
    enum: ImportMappingType,
    default: ImportMappingType.PATH,
  })
  mappingType!: ImportMappingType;

  @ApiProperty({ name: 'rules', description: "Mapping rules defined by the user" })
  @Column({ type: "jsonb" })
  rules!: Record<string, any>;

  @Column({
    name: "defaults",
    type: "jsonb",
    nullable: true,
    default: null,
    comment: "Default values for missing fields",
  })
  defaults!: Record<string, any>;

  @ApiProperty({
    name: "is_active",
    type: "boolean",
    default: true,
    description: "Flag to indicate if the import definition is active",
  })
  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  @ApiProperty({ type: "string", format: "date-time" })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  @ApiProperty({ type: "string", format: "date-time" })
  updatedAt!: Date;

  @DeleteDateColumn({
    name: "deleted_at",
    type: "timestamptz",
    nullable: true,
  })
  @ApiProperty({
    type: "string",
    format: "date-time",
    nullable: true,
    description: "Soft delete timestamp",
  })
  deletedAt?: Date | null;

  softDelete(): void {
    this.deletedAt = new Date();
  }

  restore() {
    this.deletedAt = null;
  }

  /**
   * Apply mapping rules to an input record producing a typed object
   * @param {Record<string, string>[]} input The input record to be mapped
   * @returns {T} The mapped object of type T
   */
  apply<T>(input: Record<string, string>): T {
    return applyMapping(this, input);
  }
}
