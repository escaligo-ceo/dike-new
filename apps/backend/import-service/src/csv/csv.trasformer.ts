import { Contact } from "@dike/common";
import { Injectable } from "@nestjs/common";
import { CsvMapper } from "./csv.mapper";
import { getByPath, setByPath } from "./path.utils";

export interface CsvTransformers {
  [entityField: string]: (value: any) => any;
  // es: "email": value => value.toLowerCase()
  // es: "addresses[0].label": value => value.toUpperCase()
}

@Injectable()
export class CsvTransformer {
  constructor(private readonly csvMapper: CsvMapper) {}

  /**
   * Trasforma una riga CSV in un oggetto Contact.
   * Applica mappatura e quindi trasformatori facoltativi.
   */
  transformRow(
    row: Record<string, any>,
    mapping: Record<string, string>,
    transformers?: CsvTransformers
  ): Contact {
    const entity: any = this.csvMapper.mapRowToEntity(row, mapping);

    if (transformers) {
      for (const field in transformers) {
        const transformFn = transformers[field];
        if (transformFn) {
          // Usa path utils per supportare path annidati e array notation
          const currentValue = getByPath(entity, field);
          if (currentValue !== undefined) {
            const transformedValue = transformFn(currentValue);
            setByPath(entity, field, transformedValue);
          }
        }
      }
    }

    return entity as Contact;
  }

  /**
   * Trasforma più righe CSV.
   */
  transformCsv(
    rows: Array<Record<string, any>>,
    mapping: Record<string, string>,
    transformers?: CsvTransformers
  ): Contact[] {
    return rows.map((row) => this.transformRow(row, mapping, transformers));
  }
}
