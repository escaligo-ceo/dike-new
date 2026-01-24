import { YearlyDateDto } from "./yearly-date.dto.js";
import { YearlyDate } from "./yearly-date.vo.js";

export class YearlyDateMapper {
  static toDto(data: YearlyDateDto | null): YearlyDate | null {
    if (!data) {
      return null;
    }
    return YearlyDate.create({ day: data.day, month: data.month, year: data.year });
  }

  static fromEntity(dbValue: YearlyDate | null): YearlyDateDto | null {
    if (!dbValue) {
      return null;
    }
    const { day, month, year } = dbValue;
    return { day, month, year };
  }
}