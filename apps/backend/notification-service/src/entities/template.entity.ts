import { Tenant, Token } from "@dike/common";
import { ApiGatewayService, LoggedUser } from "@dike/communication";
import { NotFoundException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Channel } from "./channel.entity";
import { Resource, ResourceType } from "./resource.entity";

// export enum TemplateType {
//   WELCOME = 'welcome',
//   PASSWORD_RESET = 'password_reset',
//   ORDER_CONFIRMATION = 'order_confirmation',
//   INVOICE = 'invoice',
// }

@Entity("templates")
export class Template {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @PrimaryGeneratedColumn("uuid", { name: "id" })
  @ApiProperty({
    type: "string",
    format: "uuid",
  })
  id: string;

  @OneToMany(() => Resource, (resource) => resource.template, { cascade: true })
  @ApiProperty({
    type: () => [Resource],
    description: "Risorse collegate a questo template",
    required: false,
  })
  resources?: Resource[];

  async tenant(
    loggedUser: LoggedUser,
    id?: string
  ): Promise<Tenant | null> {
    const tenantId = id || this.tenantId;
    return this.apiGatewayService.findTenantById(loggedUser, tenantId);
  }

  @Column({
    name: "tenant_id",
    type: "uuid",
    comment: "tenant a cui si applica il template",
  })
  @ApiProperty({
    type: "string",
    format: "uuid",
    description: "tenant a cui si applica il template",
  })
  tenantId: string;

  @ManyToOne(() => Channel, { onDelete: "CASCADE" })
  @JoinColumn({ name: "channel_id" })
  channel: Channel;

  @Column({
    name: "channel_id",
    type: "uuid",
    comment: "ID del canale a cui si applica il template",
  })
  @ApiProperty({
    type: "string",
    format: "uuid",
    description: "ID del canale a cui si applica il template",
  })
  channelId: string;

  @Column({
    name: "locale",
    type: "varchar",
    length: 5,
    comment: "Locale del template di notifica",
    default: "it-IT",
  })
  @ApiProperty({
    type: "string",
    description: "Locale del template di notifica",
    default: "it-IT",
  })
  locale: string;

  @Column("int", {
    name: "version",
    comment: "Version of the notification template",
  })
  @ApiProperty({
    type: "integer",
    description: "Version of the notification template",
  })
  version: number;

  @Column({
    name: "subject",
    comment: "Subject of the notification template",
    type: "varchar",
  })
  @ApiProperty({
    type: "string",
    description: "Subject of the notification template",
  })
  subject: string;

  @Column("jsonb", {
    name: "metadata",
    nullable: true,
    comment: "Metadata of the notification template",
  })
  @ApiProperty({
    type: "object",
    additionalProperties: true,
    nullable: true,
    description: "Metadata of the notification template",
  })
  metadata: any;

  @Column("bool", {
    name: "is_active",
    default: true,
    comment: "Indicates if the notification template is active",
  })
  @ApiProperty({
    type: "boolean",
    default: true,
    description: "Indicates if the notification template is active",
  })
  isActive: boolean;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  createdAt: Date;

  @DeleteDateColumn({
    name: "deleted_at",
    type: "timestamp",
    nullable: true,
  })
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
    description: 'Soft delete timestamp',
  })
  deletedAt?: Date | null;

  softDelete(): void {
    this.deletedAt = new Date();
  }

  restore() {
    this.deletedAt = null;
  }

  /**
   * Restituisce tutte le risorse del template di uno specifico tipo.
   * @param type Il tipo di risorsa da filtrare
   */
  getResourcesByType(type: ResourceType): Resource[] {
    if (!this.resources) return [];
    return this.resources.filter((r) => r.type === type);
  }

  addOrUpdateResource(resource: Resource): void {
    if (!this.resources) this.resources = [];
    const index = this.resources.findIndex((r) => r.type === resource.type);
    if (index !== -1) {
      this.resources[index] = resource;
    } else {
      this.resources.push(resource);
    }
  }

  async removeResourcesByType(type: ResourceType): Promise<Resource[]> {
    const resources = this.getResourcesByType(type);
    if (!resources || resources.length === 0) {
      throw new NotFoundException(`Resources not found`);
    }
    await Promise.all(resources.map((res) => res.softDelete()));
    return resources;
  }
}
