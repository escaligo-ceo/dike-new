import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Contact } from "./contact.entity.js";
import { TaxIdentifierType } from "./tax-identifier.vo.js";
import { ApiProperty } from "@nestjs/swagger";

@Entity("tax_identifiers")
export class TaxIdentifier {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "contact_id", nullable: true })
  contactId?: string;

  @ManyToOne(() => Contact, (contact) => contact.id, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "contact_id" })
  contact?: any;

  @ApiProperty({ description: "The type of the tax identifier" })
  @Column({ length: 100, name: "type" })
  type: TaxIdentifierType;

  @ApiProperty({ description: "The value of the tax identifier" })
  @Column({ length: 100, name: "value" })
  value: string;

  equals(other: TaxIdentifier): boolean {
    return other.type === this.type && other.value === this.value;
  }

  getValue(): string {
    return this.value;
  }

  getType(): TaxIdentifierType {
    return this.type;
  }
}