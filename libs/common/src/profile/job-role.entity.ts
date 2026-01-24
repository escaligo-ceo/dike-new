import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Tenant } from "../tenant/tenant.entity.js";
import { Profile } from "./profile.entity.js";

@Entity("job_roles")
// Only one default per tenant among tenant-specific roles
@Index("uniq_default_per_tenant", ["tenantId", "isDefault"], {
  unique: true,
  where: '"is_default" = true AND "tenant_id" IS NOT NULL',
})
// Only one default among standard roles (no tenant)
@Index("uniq_default_standard", ["isDefault"], {
  unique: true,
  where: '"is_default" = true AND "tenant_id" IS NULL',
})
export class JobRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "uuid", name: "tenant_id", nullable: true })
  tenantId: string | null;

  @ManyToOne(() => Tenant, (tenant) => tenant.id, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "tenant_id" })
  tenant?: Tenant;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "boolean", default: false, name: "is_custom" })
  isCustom: boolean;

  @Column({ type: "boolean", default: false, name: "is_default" })
  isDefault: boolean;

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

  // @DeleteDateColumn({
  //   name: "deleted_at",
  //   type: "timestamp",
  //   nullable: true,
  // })
  // @ApiProperty({
  //   type: 'string',
  //   format: 'date-time',
  //   nullable: true,
  //   description: 'Soft delete timestamp',
  // })
  // deletedAt?: Date | null;

  // softDelete(): void {
  //   this.deletedAt = new Date();
  // }

  // restore() {
  //   this.deletedAt = null;
  // }

  @OneToMany(() => Profile, (profile) => profile.jobRole)
  profiles: Profile[];
}
