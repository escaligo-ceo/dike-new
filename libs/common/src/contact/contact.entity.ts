import { IContact, YearlyDate, YearlyDateTransformer } from "@dike/contracts";
import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
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
import { Address } from "./address.entity.js";
import { AnagraphicSex } from "./anagraphic-sex.js";
import { BirthPlace } from "./birth-place.entity.js";
import { BirthPlaceTransformer } from "./birth-place.transformer.js";
import { FiscalCode } from "./codice-fiscale.vo.js";
import { Email } from "./email.entity.js";
import { PartitaIVA } from "./partita-iva.vo.js";
import { Phone } from "./phone.entity.js";
import { TaxIdentifier } from "./tax-identifier.entity.js";
import { TaxIdentifierType } from "./tax-identifier.vo.js";
import { Website } from "./website.entity.js";

@Entity("contacts")
export class Contact implements IContact {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "tenant_id" })
  @ApiProperty({ type: "string" })
  tenantId!: string;

  @Column({ length: 100, name: "first_name", nullable: true })
  @ApiProperty({ type: "string", name: "first_name", nullable: true })
  firstName?: string;

  @Column({ length: 50, name: "prefix", nullable: true })
  @ApiProperty({ type: "string", name: "prefix", nullable: true })
  prefix?: string;

  @Column({ length: 100, name: "middle_name", nullable: true })
  @ApiProperty({ type: "string", name: "middle_name", nullable: true })
  middleName?: string;

  @Column({ length: 100, name: "last_name", nullable: true })
  @ApiProperty({ type: "string", name: "last_name", nullable: true })
  lastName?: string;

  @Column({ length: 100, name: "phonetic_last_name", nullable: true })
  @ApiProperty({ type: "string", name: "phonetic_last_name", nullable: true })
  phoneticLastName?: string;

  @Column({ length: 100, name: "phonetic_middle_name", nullable: true })
  @ApiProperty({ type: "string", name: "phonetic_middle_name", nullable: true })
  phoneticMiddlename?: string;

  @Column({ length: 100, name: "phonetic_first_name", nullable: true })
  @ApiProperty({ type: "string", name: "phonetic_first_name", nullable: true })
  phoneticFirstName?: string;

  @Column({ length: 50, name: "suffix", nullable: true })
  @ApiProperty({ type: "string", name: "suffix", nullable: true })
  suffix?: string;

  @Column({ length: 100, name: "full_name", nullable: true })
  @ApiProperty({ type: "string", name: "full_name", nullable: true })
  fullName?: string;

  @Column({ length: 255, name: "photo_url", nullable: true })
  @ApiProperty({ type: "string", name: "photo_url", nullable: true })
  photoUrl?: string;

  @Column({ length: 100, name: "nickname", nullable: true })
  @ApiProperty({ type: "string", name: "nickname", nullable: true })
  nickname?: string;

  @Column({ type: "uuid", name: "company_id", nullable: true })
  @ApiProperty({ type: "string", name: "company_id", nullable: true })
  companyId?: string;

  @ManyToOne("Company", { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "company_id" })
  company?: any;

  @Column({
    type: "varchar",
    length: 10,
    nullable: true,
    transformer: {
      to: YearlyDateTransformer.to,
      from: YearlyDateTransformer.from,
    },
  })
  @ApiProperty({
    type: "string",
    format: "date",
    nullable: true,
  })
  birthday?: YearlyDate;

  setBirthday(birthday: YearlyDate | null) {
    this.birthday = birthday || undefined;
  }

  @Column({
    type: "varchar",
    length: 10,
    nullable: true,
    transformer: {
      to: YearlyDateTransformer.to,
      from: YearlyDateTransformer.from,
    },
  })
  @ApiProperty({
    type: "string",
    format: "date",
    nullable: true,
  })
  anniversary?: YearlyDate;

  setAnniversary(anniversary: YearlyDate | null) {
    this.anniversary = anniversary || undefined;
  }

  @Column({
    type: "jsonb",
    name: "birth_place",
    nullable: true,
    select: false,
    transformer: {
      to: BirthPlaceTransformer.to,
      from: BirthPlaceTransformer.from,
    },
  })
  @ApiProperty({
    type: "string",
    nullable: true,
  })
  birthPlace?: BirthPlace;

  @Column({
    type: "enum",
    enum: AnagraphicSex,
    name: "anagraphic_sex",
    nullable: true,
    select: false,
  })
  @ApiProperty({
    type: "string",
    enum: AnagraphicSex,
    nullable: true,
  })
  anagraphicSex?: AnagraphicSex;

  @ManyToOne("ContactType", {
    onDelete: "SET NULL",
    nullable: true,
  })
  @JoinColumn({ name: "type_id" })
  type?: any;

  @Column({ type: "text", name: "notes", nullable: true })
  @ApiProperty({ type: "string", name: "notes", nullable: true })
  notes?: string;

  @Column({ type: "uuid", name: "owner_id", nullable: true })
  @ApiProperty({ type: "string", name: "owner_id", nullable: true })
  ownerId?: string;

  @Column({ type: "varchar", length: 100, name: "custom_type", nullable: true })
  @ApiProperty({ type: "string", name: "custom_type", nullable: true })
  customType?: string;

  @Column("text", { array: true, name: "labels", nullable: true })
  @ApiProperty({ type: "array", items: { type: "string" }, nullable: true })
  labels?: string[];

  @OneToMany(() => Address, (address) => address.contact, { cascade: true })
  @ApiProperty({ type: "array", items: { type: "object" }, nullable: true })
  addresses?: Address[];

  @OneToMany(() => Phone, (phone) => phone.contact, { cascade: true })
  @ApiProperty({ type: "array", items: { type: "object" }, nullable: true })
  phones?: Phone[];

  @OneToMany(() => Email, (email) => email.contact, { cascade: true })
  @ApiProperty({ type: "array", items: { type: "object" }, nullable: true })
  emails?: Email[];

  @OneToMany(() => TaxIdentifier, (taxId) => taxId.contact, { cascade: true })
  @ApiProperty({ type: "array", items: { type: "object" }, nullable: true })
  taxIdentifiers?: TaxIdentifier[];

  @OneToMany(() => Website, (website) => website.contact, { cascade: true })
  @ApiProperty({ type: "array", items: { type: "object" }, nullable: true })
  websites?: Website[];

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

  @Column("jsonb", { name: "chats", nullable: true })
  @ApiProperty({ type: "array", items: { type: "object" }, nullable: true })
  chats?: Array<{
    id: string;
    label: string;
    value: string;
  }>;

  addTaxIdentifier(id: TaxIdentifier): void {
    if (this.taxIdentifiers?.some((ti) => ti.equals(id))) {
      return;
    }
    this.taxIdentifiers?.push(id);
  }

  getTaxIdentifiers(): TaxIdentifier[] {
    return [...(this.taxIdentifiers || [])];
  }

  get fiscalCode(): FiscalCode | undefined {
    return this.taxIdentifiers?.find(
      (ti) => ti.getType() === ("CF" as TaxIdentifierType)
    ) as FiscalCode | undefined;
  }

  get vatNumber(): PartitaIVA | undefined {
    return this.taxIdentifiers?.find(
      (ti) => ti.getType() === ("PIVA" as TaxIdentifierType)
    ) as PartitaIVA | undefined;
  }

  get preferredEmail(): string | undefined {
    const preferredEmail = this.emails?.find((email) => email.isPreferred);
    return preferredEmail?.email;
  }

  get avatarUrl(): string | undefined {
    return this.photoUrl || this.preferredEmail
      ? `https://www.gravatar.com/avatar/${this.preferredEmail?.trim().toLowerCase()}?d=identicon`
      : `./contacts/${this.id}/avatar`;
  }

  @Expose()
  get color(): string {
    const colors = [
      "#FF6B6B",
      "#FF8E72",
      "#FFA07A",
      "#FFB347",
      "#FFD700",
      "#F7DC6F",
      "#FFE135",
      "#FFEB3B",
      "#CDDC39",
      "#9CCC65",
      "#52B788",
      "#4ECDC4",
      "#45B7D1",
      "#0288D1",
      "#1976D2",
      "#3F51B5",
      "#7E57C2",
      "#AB47BC",
      "#BB8FCE",
      "#E91E63",
      "#FF4081",
      "#FF6E40",
      "#FF7043",
      "#FF5252",
    ];

    try {
      // Always use a reliable value for hashing - prefer id since it's always present
      const textToHash =
        this.id || this.preferredEmail || this.fullNameCalculated || "default";

      if (!textToHash) {
        console.error("Color calculation failed: textToHash is empty");
        return "#808080";
      }

      let hash = 0;
      for (let i = 0; i < textToHash.length; i++) {
        const char = textToHash.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }

      const colorIndex = Math.abs(hash) % colors.length;
      const selectedColor = colors[colorIndex];

      // Fallback garantito
      return selectedColor || "#808080";
    } catch (e) {
      console.error("Error in color getter:", e);
      return "#808080";
    }
  }

  get initials(): string {
    const firstInitial = this.firstName
      ? this.firstName.charAt(0).toUpperCase()
      : "";
    const lastInitial = this.lastName
      ? this.lastName.charAt(0).toUpperCase()
      : "";
    return `${firstInitial}${lastInitial}`;
  }

  get fullNameCalculated(): string {
    const parts = [this.firstName, this.middleName, this.lastName].filter(
      Boolean
    );
    const companyName = this.company ? this.company.name.trim() : null;
    const res = this.fullName ? this.fullName : parts.join(" ").trim();
    if (companyName !== null && companyName !== "") {
      return `${res} | ${companyName}`;
    }
    return res;
  }

  get avatar(): string {
    return this.generateAvatarSvg();
  }

  private generateAvatarSvg(): string {
    // Calcola il colore inline invece di usare il getter per evitare problemi di serializzazione
    const colors = [
      "#FF6B6B",
      "#FF8E72",
      "#FFA07A",
      "#FFB347",
      "#FFD700",
      "#F7DC6F",
      "#FFE135",
      "#FFEB3B",
      "#CDDC39",
      "#9CCC65",
      "#52B788",
      "#4ECDC4",
      "#45B7D1",
      "#0288D1",
      "#1976D2",
      "#3F51B5",
      "#7E57C2",
      "#AB47BC",
      "#BB8FCE",
      "#E91E63",
      "#FF4081",
      "#FF6E40",
      "#FF7043",
      "#FF5252",
    ];

    const textToHash =
      this.id || this.preferredEmail || this.fullNameCalculated || "default";

    console.log(
      `[Avatar] id=${this.id}, email=${this.preferredEmail}, fullName=${this.fullNameCalculated}, textToHash=${textToHash}`
    );

    let hash = 0;
    for (let i = 0; i < textToHash.length; i++) {
      const char = textToHash.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    const colorIndex = Math.abs(hash) % colors.length;
    const backgroundColor = colors[colorIndex] || "#808080";

    console.log(
      `[Avatar] colorIndex=${colorIndex}, backgroundColor=${backgroundColor}`
    );

    const initials = this.initials || "?";

    // Calcola il colore del testo in base alla luminosità del background
    const textColor = this.getContrastColor(backgroundColor);

    // return encodeURIComponent(`
    //   <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    //     <!-- Sfondo con angoli arrotondati stile Outlook -->
    //     <rect
    //       x="0"
    //       y="0"
    //       width="128"
    //       height="128"
    //       rx="8"
    //       ry="8"
    //       fill="${backgroundColor}"
    //       opacity="1" />

    //     <!-- Iniziali centrate -->
    //     <text
    //       x="64"
    //       y="64"
    //       dominant-baseline="middle"
    //       text-anchor="middle"
    //       fill="${textColor}"
    //       font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    //       font-size="52"
    //       font-weight="600"
    //       letter-spacing="0">
    //       ${initials}
    //     </text>
    //   </svg>
    // `).trim();

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
        <rect
          width="128"
          height="128"
          rx="8"
          fill="${backgroundColor}"/>
        <text
          x="64"
          y="64"
          dominant-baseline="middle"
          text-anchor="middle"
          fill="${textColor}"
          font-size="52"
          font-weight="600"
          font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          letter-spacing="0">
          ${initials}
        </text>
      </svg>
      `.trim();
  }

  private getContrastColor(hexColor: string): string {
    // Rimuovi il # se presente
    const hex = hexColor.replace("#", "");

    // Converti hex a RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calcola la luminosità relativa (formula WCAG)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Ritorna bianco se lo sfondo è scuro, nero se è chiaro
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  }
}
