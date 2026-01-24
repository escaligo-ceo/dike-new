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
import { AddressType, IAddress } from "@dike/contracts";

@Entity("addresses")
export class Address implements IAddress{
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "uuid", name: "owner_id", nullable: true })
  ownerId!: string;

  @Column({ type: "uuid", name: "contact_id", nullable: true })
  contactId?: string;

  @ManyToOne("Contact", "addresses", {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "contact_id" })
  contact?: any;

  @Column({ length: 200, name: "street" })
  street?: string;

  @Column({ length: 200, name: "street2", nullable: true })
  street2?: string;

  @Column({ length: 100, name: "city" })
  city?: string;

  @Column({ length: 100, name: "state", nullable: true })
  state?: string;

  @Column({ length: 100, name: "country" })
  country?: string;

  @Column({ length: 20, name: "postal_code" })
  postalCode?: string;

  @Column({ length: 100, name: "label", nullable: true })
  label?: string;

  @Column({ length: 50, name: "po_box", nullable: true })
  poBox?: string;

  @Column({ type: "text", name: "formatted", nullable: true })
  formatted?: string;

  @Column({
    type: "enum",
    enum: AddressType,
    name: "type",
    default: AddressType.HOME,
  })
  type?: AddressType;

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

  @Column({ type: "boolean", name: "is_preferred", default: false })
  isPreferred?: boolean;

  @Column({ type: "varchar", length: 255, name: "fingerprint", nullable: true, unique: true })
  fingerprint?: string;
}
