import { Tenant, Token } from "@dike/common";
import { ApiGatewayService, LoggedUser } from "@dike/communication";
import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Channel } from "./channel.entity";
import { Template } from "./template.entity";

export enum NotificationPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
}

export enum NotificationStatus {
  PENDING = "pending",
  SENT = "sent",
  FAILED = "failed",
}

/**
 * Livello di personalizzazione consentita per la notifica:
 * 0: Nessuna personalizzazione, solo template di sistema
 * 1: Personalizzazione a livello di tenant
 * 2: Personalizzazione a livello di utente
 */
export enum NotificationCustomizationLevel {
  SYSTEM = 0,
  TENANT = 1,
  USER = 2,
}

@Entity("notifications")
export abstract class Notification {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @PrimaryGeneratedColumn({
    name: "id",
  })
  @ApiProperty({
    type: "string",
    format: "uuid",
  })
  id: string;

  @Column({
    name: "customization_level",
    type: "enum",
    enum: NotificationCustomizationLevel,
    default: NotificationCustomizationLevel.SYSTEM,
    comment:
      "Livello di personalizzazione consentita (0: sistema, 1: tenant, 2: utente)",
  })
  @ApiProperty({
    enum: NotificationCustomizationLevel,
    enumName: "NotificationCustomizationLevel",
    default: NotificationCustomizationLevel.SYSTEM,
    description:
      "Livello di personalizzazione consentita (0: sistema, 1: tenant, 2: utente)",
  })
  customizationLevel: NotificationCustomizationLevel;

  async tenant(
    loggedUser: LoggedUser,
    id?: string
  ): Promise<Tenant | null> {
    const tenantId = id || this.id;
    return this.apiGatewayService.findTenantById(loggedUser, tenantId);
  }

  @Column({
    name: "tenant_id",
    nullable: true,
    comment: "ID del tenant associato alla notifica",
  })
  @ApiProperty({
    type: "string",
    format: "uuid",
    nullable: true,
    description: "ID del tenant associato alla notifica",
  })
  tenantId?: string;

  @ManyToMany(() => Channel, { onDelete: "CASCADE" })
  channels: Channel[];

  @Column({
    type: "uuid",
    comment: "ID del canale usato per inviare la notifica",
    name: "channel_id",
  })
  @ApiProperty({
    type: "string",
    format: "uuid",
    description: "ID del canale usato per inviare la notifica",
  })
  channelId: Channel;

  @ManyToOne(() => Template, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "template_id" })
  @ApiProperty({
    type: () => Template,
    nullable: true,
    description: "Template associato alla notifica",
  })
  template?: Template;

  @Column({
    name: "template_id",
    nullable: true,
    comment: "ID del template associato alla notifica",
  })
  @ApiProperty({
    type: "string",
    format: "uuid",
    nullable: true,
    description: "ID del template associato alla notifica",
  })
  templateId?: string;

  @Column({
    name: "priority",
    type: "enum",
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
  })
  @ApiProperty({
    enum: NotificationPriority,
    enumName: "NotificationPriority",
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @Column({
    name: "status",
    type: "enum",
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  @ApiProperty({
    enum: NotificationStatus,
    enumName: "NotificationStatus",
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

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

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  updatedAt!: Date;

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

  @Column({
    type: "timestamptz",
    name: "sent_at",
    nullable: true,
    default: null,
  })
  @ApiProperty({
    type: "string",
    format: "date-time",
    nullable: true,
  })
  sentAt?: Date;

  @Column({
    nullable: true,
    name: "scheduled_at",
    type: "timestamp",
  })
  @ApiProperty({
    type: "string",
    format: "date-time",
    required: false,
  })
  scheduledAt?: Date;
}
