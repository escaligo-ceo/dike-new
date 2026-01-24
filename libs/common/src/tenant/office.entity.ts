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
import { ApiProperty } from "@nestjs/swagger";
import { IOffice } from "./office.interface.js";

@Entity("offices")
export class Office implements IOffice {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid", { name: "tenant_id" })
  tenantId!: string;

  @ManyToOne("Tenant", {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "tenant_id" })
  tenant: any;

  @Column({ type: "varchar", length: 255, name: "name" })
  name!: string;

  @Column({ type: "text", name: "description", nullable: true })
  description?: string;

  @Column({ type: "uuid", name: "address_id", nullable: true })
  addressId?: string;

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