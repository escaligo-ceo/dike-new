import { Injectable } from "@nestjs/common";
import { setByPath } from "./path.utils";

export interface CsvMapping {
  [csvColumn: string]: string;
  // es.: "first_name": "firstName"
  //      "address[0].street": "addresses[0].street"
  //      "address[0].label": "addresses[0].label"
  //      "phone[0].number": "phones[0].number"
}

@Injectable()
export class CsvMapper {
  /**
   * Applica una mappatura CSV → entità a una singola riga.
   * @param row riga del CSV (key = nome colonna)
   * @param mapping oggetto CsvMapping
   * @returns oggetto pronto da salvare
   *
   * Supporta notazione array:
   * - "address[0].street" → addresses[0].street
   * - "address[0].label" → addresses[0].label (stesso elemento)
   * - "address[1].street" → addresses[1].street (elemento diverso)
   */
  mapRowToEntity(row: Record<string, any>, mapping: CsvMapping) {
    const entity: Record<string, any> = {};

    for (const csvColumn in mapping) {
      const entityPath = mapping[csvColumn];

      if (!(csvColumn in row)) {
        continue; // colonna assente nel CSV
      }

      const value = row[csvColumn];
      if (value === null || value === undefined || value === "") {
        continue; // Salta valori vuoti
      }

      setByPath(entity, entityPath, value);
    }

    return entity;
  }

  /**
   * Applica la mappatura a più righe del CSV.
   */
  mapCsv(rows: Array<Record<string, any>>, mapping: CsvMapping) {
    return rows.map((row) => this.mapRowToEntity(row, mapping));
  }
}
