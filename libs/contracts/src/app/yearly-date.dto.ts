import { IYearlyDate } from "./yearly-date.interface.js";

export class YearlyDateDto implements IYearlyDate {
  readonly day: number; // 1..31
  readonly month: number; // 1..12
  readonly year?: number; // opzionale

  toString(): string {
    return this.year
      ? `${this.day}/${this.month}/${this.year}`
      : `${this.day}/${this.month}`;
  }
}