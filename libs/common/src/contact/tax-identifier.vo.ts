import { ITaxIdentifier } from "./tax-identifier.interface.js";

export type TaxIdentifierType = "VAT" | "TAX_CODE" | "SSN" | "EIN" | "OTHER";

/**
 * Value Object representing a Tax Identifier.
 */
export class TaxIdentifierVO implements ITaxIdentifier {
  constructor(
    public readonly type: TaxIdentifierType,
    public readonly value: string
  ) {
    if (!value || value.trim() === "") {
      throw new Error("Tax Identifier number cannot be empty.");
    }
  }
  equals(other: ITaxIdentifier): boolean {
    if (!(other instanceof TaxIdentifierVO)) {
      return false;
    }
    return this.type === other.type && this.value === other.value;
  }

  /**
   * Returns a string representation of the Tax Identifier.
   * @returns {string} - String in the format "TYPE: NUMBER"
   */
  toString(): string {
    return `${this.type}: ${this.value}`;
  }

  getValue(): string {
    return this.value;
  }

  getType(): TaxIdentifierType {
    return this.type;
  }
}

