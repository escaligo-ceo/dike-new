import { FiscalCode } from "./codice-fiscale.vo.js";
import { FiscalCodeGenerator } from "./fiscal-code-generator.js";
import { PartitaIVA } from "./partita-iva.vo.js";
import { ITaxIdentifier } from "./tax-identifier.interface.js";

export class TaxIdentifierFactory {
  /**
   * Crea un TaxIdentifier da input grezzo
   * Riconosce automaticamente CF o P.IVA
   */
  static create(input: string): ITaxIdentifier {
    const normalized = input.trim().toUpperCase();

    // Codice Fiscale
    if (/^[A-Z0-9]{16}$/.test(normalized)) {
      return FiscalCode.create(normalized);
    }

    // Partita IVA
    if (/^\d{11}$/.test(normalized)) {
      return PartitaIVA.create(normalized);
    }

    throw new Error('Invalid tax identifier');
  }

  /**
   * Genera il CF da dati anagrafici
   */
  static generateFiscalCode(input: {
    firstName: string;
    lastName: string;
    birthDate: Date;
    gender: 'M' | 'F';
    birthPlaceCode: string;
  }): FiscalCode {
    const allCFs = FiscalCodeGenerator.generateAll(input);
    return allCFs[0]; // restituisce il CF principale
  }

  /**
   * Genera tutte le omocodie possibili del CF
   */
  static generateFiscalCodeWithOmocodie(input: {
    firstName: string;
    lastName: string;
    birthDate: Date;
    gender: 'M' | 'F';
    birthPlaceCode: string;
  }): FiscalCode[] {
    return FiscalCodeGenerator.generateAll(input);
  }
}
