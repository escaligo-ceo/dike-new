import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Invite } from "./invite.entity.js";

@Entity("teams")
export class Team {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "name", type: "varchar", length: 255 })
  name!: string;

  @OneToMany("Member", "team")
  members: any[];

  @OneToMany("Role", "team")
  roles: any[];

  @OneToMany(() => Invite, (invite) => invite.tenant)
  invites: Invite[];

  @ManyToOne("Tenant", "teams")
  tenant: any;
}
