import { ITaxIdentifier } from "./tax-identifier.interface.js";
import { TaxIdentifierType, TaxIdentifierVO } from "./tax-identifier.vo.js";

export class PartitaIVA implements ITaxIdentifier {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(input: string): PartitaIVA {
    const normalized = input.trim();

    if (!/^\d{11}$/.test(normalized)) {
      throw new Error("Invalid VAT number format");
    }

    if (!this.isValidChecksum(normalized)) {
      throw new Error("Invalid VAT number checksum");
    }

    return new PartitaIVA(normalized);
  }

  getValue(): string {
    return this.value;
  }

  getType(): TaxIdentifierType {
    return "PIVA" as TaxIdentifierType;
  }

  equals(other: TaxIdentifierVO): boolean {
    return other.getType() === "PIVA" as TaxIdentifierType && other.getValue() === this.value;
  }

  private static isValidChecksum(value: string): boolean {
    let sum = 0;

    for (let i = 0; i < 10; i++) {
      let n = Number(value[i]);

      if (i % 2 === 0) {
        n *= 2;
        if (n > 9) n -= 9;
      }

      sum += n;
    }

    const check = (10 - (sum % 10)) % 10;
    return check === Number(value[10]);
  }
}
