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
  UpdateDateColumn,
} from "typeorm";
import { Profile } from "../profile/profile.entity.js";
import { Invite } from "./invite.entity.js";
import { Membership } from "./membership.entity.js";
import { Office } from "./office.entity.js";
import { Team } from "./team.entity.js";

@Entity("tenant")
export class Tenant {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: "uuid", name: "owner_id" })
  ownerId!: string;

  @ManyToOne(() => Profile, { nullable: false })
  @JoinColumn({ name: "owner_id", referencedColumnName: "userId" })
  owner: Profile;

  @OneToMany(() => Membership, (membership) => membership.tenant)
  memberships: Membership[];

  @OneToMany(() => Office, (office) => office.tenant)
  offices: Office[];

  @OneToMany(() => Team, (team) => team.id)
  teams: Team[];

  @OneToMany(() => Invite, (invite) => invite.tenant)
  invites: Invite[];

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
  })
  deletedAt?: Date | null;

  softDelete(): void {
    this.deletedAt = new Date();
  }

  restore() {
    this.deletedAt = null;
  }
}
