import { ITaxIdentifier, TaxIdentifierType } from "@dike/contracts";
import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum CodiceCatastaleType {
  COMUNE = "COMUNE",
  STATO_ESTERO = "STATO ESTERO",
}

@Entity("codice_catastale")
export class CodiceCatastale {
  @ApiProperty({ description: "The unique identifier of the codice catastale" })
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ApiProperty({ description: "The name of the municipality or foreign state" })
  @Column({ length: 100 })
  city?: string;

  @ApiProperty({
    description: "The province associated with the codice catastale",
    required: false,
  })
  @Column({ nullable: true, length: 100 })
  state?: string;

  @ApiProperty({ description: "The codice catastale", example: "H501" }) // Codice Comune formato numerico
  @Column({ length: 10 })
  value?: string;

  @ApiProperty({ description: "The type of the codice catastale" })
  @Column({ type: "enum", enum: CodiceCatastaleType, default: CodiceCatastaleType.COMUNE })
  type!: CodiceCatastaleType;

  // @ApiProperty({
  //   description: "The date since the codice catastale is valid",
  //   required: false,
  // })
  // @Column({ nullable: true })
  // since?: Date;

  // @ApiProperty({
  //   description: "The date until the codice catastale is valid",
  //   required: false,
  // })
  // @Column({ nullable: true })
  // to?: Date;

  // equals(other: ITaxIdentifier): boolean {
  //   if (!(other instanceof CodiceCatastale)) {
  //     return false;
  //   }
  //   return this.type === other.type && this.value === other.value;
  // }
  // codiceRegione?: string;
  // codiceUnitaTerritorialeSovracomunale?: string;
  // codiceProvinciaStorico?: string;
  // progressivoComune?: string;
  // codiceComuneFormatoAlfanumerico?: string;
  // nameMixed?: string; // Denominazione (Iataliana e Straniera) with proper casing
  // italianName?: string; // Denominazione Italiana
  // foreignName?: string; // Denominazione altra lingua
  // regionName?: string; // Denominazione regione
  // stateName?: string; // Denominazione provincia o Stato Estero
  // tipoUnitaTerritorialeSovracomunale?: string; // Tipologia di Unità territoriale sovracomunale 
}
