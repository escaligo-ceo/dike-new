import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { OnboardingStatus, OnboardingStep } from "./onboarding.enum.js";

export const onboardingsTableName = "onboardings";

@Entity({ name: onboardingsTableName })
export class Onboarding {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column({ type: "varchar", length: 64, name: "user_id", unique: true })
  @ApiProperty({
    type: "string",
    description: "User ID associated with the onboarding process",
  })
  userId: string;

  @Column({ type: "varchar", length: 50, name: "status", default: "STARTED" })
  @ApiProperty({
    type: "string",
    description: "Current onboarding step",
  })
  step: OnboardingStep;

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

  @Column({ type: "uuid", name: "tenant_id", nullable: true })
  tenantId?: string;

  @Column({ type: "text", name: "error", nullable: true })
  error?: string;

  getStatusFromStep(): OnboardingStatus {
    if (this.error) return OnboardingStatus.FAILED;

    switch (this.step) {
      case OnboardingStep.NOT_STARTED:
        return OnboardingStatus.NOT_STARTED;
      case OnboardingStep.STARTED:
        return OnboardingStatus.IN_PROGRESS;
      case OnboardingStep.USER_CREATION:
        return OnboardingStatus.USER_CREATED;
      case OnboardingStep.PROFILE_CREATION:
        return OnboardingStatus.PROFILE_CREATED;
      case OnboardingStep.TENANT_CREATION:
        return OnboardingStatus.TENANT_CREATED;
      case OnboardingStep.TEAM_CREATION:
        return OnboardingStatus.TEAM_CREATED;
      case OnboardingStep.OFFICE_CREATION:
        return OnboardingStatus.OFFICE_CREATED;
      case OnboardingStep.ASSIGN_SUBSCRIPTION:
        return OnboardingStatus.SUBSCRIPTION_ASSIGNED;
      case OnboardingStep.SEND_INVITATIONS:
        return OnboardingStatus.IN_PROGRESS;
      case OnboardingStep.COMPLETED:
        return OnboardingStatus.COMPLETED;
      case OnboardingStep.FAILED:
        return OnboardingStatus.FAILED;
    }
  }

  @Column({ type: "simple-array", name: "completed_steps", nullable: true })
  completedSteps!: OnboardingStep[];
}
