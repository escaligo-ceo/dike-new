import { Email } from "@dike/common";
import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("watched_persons")
export class WatchedPerson {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column()
  firstName?: string;

  @Index()
  @Column()
  lastName?: string;

  @Index()
  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  notes?: string;

  // Flag: true se la persona si è registrata al sistema
  @Column({ type: "boolean", default: false })
  registered?: boolean;

  // Data/ora della registrazione effettiva
  @Column({ type: "timestamp", nullable: true })
  registeredAt?: Date;

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
