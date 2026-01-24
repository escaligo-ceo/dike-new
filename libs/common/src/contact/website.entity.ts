import { IWebsite, WebsiteType } from "@dike/contracts";
import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Contact } from "./contact.entity.js";

@Entity("websites")
export class Website implements IWebsite {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "uuid", name: "owner_id", nullable: true })
  ownerId!: string;

  @Column({ type: "uuid", name: "contact_id", nullable: true })
  contactId?: string;

  @ManyToOne(() => Contact, (contact) => contact.id, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "contact_id" })
  contact?: any;

  @Column({ length: 255, name: "url" })
  url: string;

  @Column({ length: 100, name: "label", nullable: true })
  label?: string;

  @Column({ type: "boolean", name: "is_preferred", default: false })
  isPreferred?: boolean;

  @Column({ length: 50, name: "type", nullable: true })
  type?: WebsiteType;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  @ApiProperty({ type: "string", format: "date-time" })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  @ApiProperty({ type: "string", format: "date-time" })
  updatedAt: Date;

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
}
