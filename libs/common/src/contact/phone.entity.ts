import { ApiProperty } from "@nestjs/swagger";
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
import { PhoneType } from "@dike/contracts";

@Entity("phones")
@Index(["number", "contactId", "isPreferred"], {
  where: '"is_preferred" = true',
  unique: true,
})
@Index(["number", "companyId", "isPreferred"], {
  where: '"is_preferred" = true',
  unique: true,
})
export class Phone {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "uuid", name: "owner_id", nullable: true })
  ownerId!: string;

  @Column({ type: "uuid", name: "contact_id", nullable: true })
  contactId?: string;

  @Column({ type: "uuid", name: "company_id", nullable: true })
  companyId?: string;

  @Column({ length: 30, name: "number" })
  number: string;

  @Column({ length: 100, name: "label", nullable: true })
  label?: string;

  @Column({ type: "boolean", name: "is_preferred", default: false })
  isPreferred?: boolean;

  @Column({
    type: "enum",
    enum: PhoneType,
    name: "type",
    default: PhoneType.MOBILE,
  })
  type?: PhoneType;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  @ApiProperty({ type: "string", format: "date-time" })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  @ApiProperty({ type: "string", format: "date-time" })
  updatedAt: Date;

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

  @ManyToOne("Contact", "phones", {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "contact_id" })
  contact?: any;

  @ManyToOne("Company", "phones", {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "company_id" })
  company?: any;
}