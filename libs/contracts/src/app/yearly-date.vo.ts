import { IYearlyDate } from "./yearly-date.interface.js";

export class YearlyDate implements IYearlyDate {
  readonly day: number; // 1..31
  readonly month: number; // 1..12
  readonly year?: number; // opzionale

  constructor(params: { day: number; month: number; year?: number }) {
    this.day = params.day;
    this.month = params.month;
    this.year = params.year;
  }

  static create(params: {
    day: number;
    month: number;
    year?: number;
  }): YearlyDate {
    if (!YearlyDate.isValid(params)) {
      throw new Error(
        `Invalid date: ${params.day}-${params.month}-${params.year ?? ""}`
      );
    }
    return new YearlyDate(params);
  }

  static isValid({
    day,
    month,
    year,
  }: {
    day: number;
    month: number;
    year?: number;
  }): boolean {
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    const referenceYear = year ?? 2000; // anno bisestile se necessario
    const maxDays = new Date(referenceYear, month, 0).getDate();

    return day <= maxDays;
  }

  isComplete(): boolean {
    return this.year !== undefined;
  }

  equals(other: YearlyDate): boolean {
    return (
      this.day === other.day &&
      this.month === other.month &&
      this.year === other.year
    );
  }

  toDisplayString(): string {
    return this.year
      ? `${this.day}/${this.month}/${this.year}`
      : `${this.day}/${this.month}`;
  }

  getAge(referenceDate = new Date()): number | null {
    if (!this.year) return null;

    let age = referenceDate.getFullYear() - this.year;

    const hasHadBirthdayThisYear =
      referenceDate.getMonth() + 1 > this.month ||
      (referenceDate.getMonth() + 1 === this.month &&
        referenceDate.getDate() >= this.day);

    if (!hasHadBirthdayThisYear) {
      age -= 1;
    }

    return age;
  }
}
