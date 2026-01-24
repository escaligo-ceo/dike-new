import { ApiProperty } from "@nestjs/swagger";
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

@Entity("contact_types")
export class ContactType {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "tenant_id", nullable: true, default: null })
  tenantId!: string | null;

  @Column({ type: "uuid", name: "owner_id", nullable: true, default: null })
  ownerId!: string | null;

  @Column({ type: "uuid", name: "contact_id", nullable: true, default: null })
  contactId?: string | null;
  
  @ManyToOne("Contact", "addresses", {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "contact_id" })
  contact?: any;

  @Column({ type: "varchar", length: 100, name: "name" })
  name!: string;

  @Column({ type: "text", name: "description", nullable: true, default: null })
  description?: string | null;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  @ApiProperty({ type: "string", format: "date-time" })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  @ApiProperty({ type: "string", format: "date-time" })
  updatedAt!: Date;

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
