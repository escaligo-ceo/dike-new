import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { InviteStatus } from "./invite.enum.js";

@Entity("invites")
export class Invite {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne("Tenant", "invites", { onDelete: "CASCADE" })
  tenant: any;

  @ManyToOne("Role", "invites", { onDelete: "SET NULL" })
  role: any;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId!: string;

  @Column()
  email!: string;

  @Column()
  token!: string;

  @Column({ name: "expires_at", type: "timestamp" })
  expiresAt!: Date;

  @Column({ type: "varchar", length: 20, default: InviteStatus.PENDING })
  status!: InviteStatus;

  link(frontendBaseUrl: string): string {
    return `${frontendBaseUrl}/invite/${this.token}`;
  }
}
