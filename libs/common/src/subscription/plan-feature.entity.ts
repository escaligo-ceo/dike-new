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
import { Feature } from "./feature.entity.js";
import { ApiProperty } from "@nestjs/swagger";

export const planFeatureTableName = "plan_features";
@Entity({ name: planFeatureTableName })
export class PlanFeature {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "plan_id", type: "uuid" })
  planId!: string;

  @ManyToOne("Plan", "features", { onDelete: "CASCADE" })
  @JoinColumn({ name: "plan_id" })
  plan?: any;

  @Column({ name: "feature_id", type: "string" })
  featureId!: string;

  @ManyToOne(() => Feature, { eager: false })
  @JoinColumn({ name: "feature_id" })
  feature?: Feature;

  @Column({ name: "limit", type: "int", nullable: true, default: null })
  limit?: number | null;

  @Column({
    name: "since",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  since!: Date;

  @Column({ name: "to", type: "timestamptz", nullable: true, default: null })
  to?: Date | null;

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
