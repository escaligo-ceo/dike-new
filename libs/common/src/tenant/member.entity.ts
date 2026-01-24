import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("members")
export class Member {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne("Team", "members", { onDelete: "CASCADE" })
  team: any;

  @ManyToOne("Role", "members", { onDelete: "SET NULL" })
  role: any;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({
    name: "joined_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  joinedAt: Date;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive!: boolean;
}
