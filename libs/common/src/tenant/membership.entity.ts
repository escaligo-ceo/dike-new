import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export const membershipTableName = "membership";
@Entity(membershipTableName)
@Index(["tenant", "userId"], { unique: true })
export class Membership {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("uuid", { name: "tenant_id" })
  tenantId!: string;

  @ManyToOne("Tenant", "memberships", {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "tenant_id" })
  tenant: any;

  @Column("uuid", { name: "user_id" })
  userId!: string;

  @ManyToOne("Profile", "memberships", {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id", referencedColumnName: "userId" })
  profile: any;

  @Column({ default: "member" })
  role: string;

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
}