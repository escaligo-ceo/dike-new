import { ITaxIdentifier } from "./tax-identifier.interface.js";
import { TaxIdentifierType } from "./tax-identifier.vo.js";

export class FiscalCode implements ITaxIdentifier {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  getType(): TaxIdentifierType {
    return 'CF' as TaxIdentifierType;
  }

  equals(other: ITaxIdentifier): boolean {
    if (!(other instanceof FiscalCode)) {
      return false;
    }
    return this.value === other.value;
  }

  public static create(input: string): FiscalCode {
    if (!input) {
      throw new Error('Fiscal code is required');
    }

    const normalized = input.toUpperCase().trim();

    if (!this.isValidFormat(normalized)) {
      throw new Error('Invalid fiscal code format');
    }

    if (!this.isValidChecksum(normalized)) {
      throw new Error('Invalid fiscal code checksum');
    }

    return new FiscalCode(normalized);
  }

  public getValue(): string {
    return this.value;
  }

  public toString(): string {
    return this.value;
  }

  // =====================
  // Validation helpers
  // =====================

  private static isValidFormat(value: string): boolean {
    return /^[A-Z0-9]{16}$/.test(value);
  }

  private static isValidChecksum(value: string): boolean {
    const evenMap: Record<string, number> = {
      '0': 0, '1': 1, '2': 2, '3': 3, '4': 4,
      '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      A: 0, B: 1, C: 2, D: 3, E: 4,
      F: 5, G: 6, H: 7, I: 8, J: 9,
      K: 10, L: 11, M: 12, N: 13, O: 14,
      P: 15, Q: 16, R: 17, S: 18, T: 19,
      U: 20, V: 21, W: 22, X: 23, Y: 24, Z: 25,
    };

    const oddMap: Record<string, number> = {
      '0': 1, '1': 0, '2': 5, '3': 7, '4': 9,
      '5': 13, '6': 15, '7': 17, '8': 19, '9': 21,
      A: 1, B: 0, C: 5, D: 7, E: 9,
      F: 13, G: 15, H: 17, I: 19, J: 21,
      K: 2, L: 4, M: 18, N: 20, O: 11,
      P: 3, Q: 6, R: 8, S: 12, T: 14,
      U: 16, V: 10, W: 22, X: 25, Y: 24, Z: 23,
    };

    let sum = 0;

    for (let i = 0; i < 15; i++) {
      const char = value[i];
      sum += i % 2 === 0 ? oddMap[char] : evenMap[char];
    }

    const controlChar = String.fromCharCode((sum % 26) + 65);
    return controlChar === value[15];
  }
}
