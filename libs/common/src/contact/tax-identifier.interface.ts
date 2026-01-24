import { TaxIdentifierType } from "./tax-identifier.vo.js";

export interface ITaxIdentifier {
  getValue(): string;
  getType(): TaxIdentifierType;
  equals(other: ITaxIdentifier): boolean;
}