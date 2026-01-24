import { YearlyDateDto } from "./yearly-date.dto.js";
import { YearlyDate } from "./yearly-date.vo.js";

export class YearlyDateTransformer {
  static to(data: YearlyDateDto | null): string | null {
    if (!data) {
      return null;
    }
    const yearPart = data.year !== undefined ? `-${data.year}` : "";
    return `${data.day}-${data.month}${yearPart}`;
  }

  static from(dbValue: YearlyDateDto | null | undefined): YearlyDate | undefined {
    if (!dbValue) {
      return undefined;
    }
    const { day, month, year } = dbValue;
    return YearlyDate.create({ day, month, year });
  }
}