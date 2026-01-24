import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Contact } from "./contact.entity.js";
import { ApiProperty } from "@nestjs/swagger";
import { Address } from "./address.entity.js";
import { Phone } from "./phone.entity.js";
import { Email } from "./email.entity.js";
import { TaxIdentifier } from "./tax-identifier.entity.js";

@Entity("companies")
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "tenant_id" })
  tenantId!: string;

  @Column({ type: "uuid", name: "owner_id" })
  ownerId!: string;

  @Column({ type: "uuid", name: "contact_id", nullable: true })
  contactId?: string;

  @ManyToOne(() => Contact, (contact) => contact.id, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "contact_id" })
  contact?: any;

  @Column({ type: "varchar", length: 150, name: "name" })
  name: string;

  @Column({ type: "varchar", length: 150, name: "department", nullable: true })
  department?: string;

  @Column({ type: "varchar", length: 50, name: "VAT_code", nullable: true })
  VATcode?: string;

  @Column({ type: "varchar", length: 50, name: "SDI_code", nullable: true })
  SDIcode?: string;

  @Column({ type: "varchar", length: 150, name: "title", nullable: true })
  title?: string;

  @OneToMany(() => Address, (address) => address.contact, { cascade: true })
  addresses?: Address[];

  @OneToMany(() => Phone, (phone) => phone.contact, { cascade: true })
  phones?: any[];

  @OneToMany(() => Email, (email) => email.contact, { cascade: true })
  emails?: Email[];

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

  @OneToMany(() => Contact, (contact) => contact.id)
  contacts: Contact[];

  @OneToMany(() => TaxIdentifier, (taxIdentifier) => taxIdentifier.contact, { cascade: true })
  taxIdentifiers?: TaxIdentifier[];
}
