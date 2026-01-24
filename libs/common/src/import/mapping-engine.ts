import { ImportMappingType, Mapping } from "./mapping.entity.js";

/**
 * Retrieves a value from an object at the specified path.
 * @param {object} obj - source object
 * @param {string} path - dot/bracket notation path
 * @returns {any}
 */
function getByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

/**
 * Sets a value on an object at the specified path.
 * @param {object} obj - target object
 * @param {string} path - dot/bracket notation path
 * @param {any} value - value to set
 * @returns {void}
 */
function setByPath(obj: any, path: string, value: any): void {
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    const nextKey = i < parts.length - 1 ? parts[i + 1] : null;
    const isIndex = /^\d+$/.test(nextKey || "");
    if (i === parts.length - 1) {
      cur[key] = value;
    } else {
      // Check if property exists and is an object/array, or doesn't exist
      const existingValue = cur[key];
      const isValidContainer =
        existingValue && typeof existingValue === "object";

      if (!isValidContainer) {
        // Overwrite with array or object based on next key
        cur[key] = isIndex ? [] : {};
      }
      cur = cur[key];
    }
  }
}

/**
 * Extracts array references from a path string.
 * @param {string} path - path string (e.g., "emails[0].email")
 * @returns {Array} - array of { arrayPath, index, fieldPath } or null if not array notation
 * @example
 * parseArrayPath("emails[0].email") => { arrayPath: "emails", index: 0, fieldPath: "email" }
 * parseArrayPath("firstName") => null
 */
function parseArrayPath(
  path: string
): { arrayPath: string; index: number; fieldPath: string } | null {
  const match = path.match(/^(.+?)\[(\d+)\]\.(.+)$/);
  if (match) {
    return {
      arrayPath: match[1],
      index: parseInt(match[2], 10),
      fieldPath: match[3],
    };
  }
  return null;
}

/**
 * Applies the given mapping to the input record.
 * @param {Mapping} mapping - mapping entity with rules and defaults
 * @param {Record<string, any>} input - input record to be mapped
 * @returns {any} - mapped output record
 * @example
 * const mapping: Mapping = {
 *   mappingType: ImportMappingType.PATH,
 *   rules: {
 *     "first_name": "firstName",
 *     "last_name": "lastName",
 *     "email_1": "emails[0].email",
 *     "phone_number": "phones[0].phone"
 *   },
 *   defaults: { "status": "active" }
 * };
 * const input = { first_name: "John", last_name: "Doe", email_1: "john@example.com", phone_number: "+39123456789" };
 * const output = applyMapping(mapping, input);
 * // output = {
 * //   firstName: "John",
 * //   lastName: "Doe",
 * //   emails: [{ email: "john@example.com" }],
 * //   phones: [{ phone: "+39123456789" }],
 * //   status: "active"
 * // }
 */
export function applyMapping<T>(
  mapping: Mapping,
  input: Record<string, string>
): T {
  const out: any = {};

  switch (mapping.mappingType) {
    case ImportMappingType.PATH:
    default: {
      // Rules format: { "first_name": "firstName", "last_name": "lastName" }
      // Maps from CSV column (key) to output field (value)
      const rules = mapping.rules || {};
      for (const [sourcePath, destKey] of Object.entries(rules)) {
        if (!sourcePath || !destKey) continue;
        const value = getByPath(input, sourcePath as string);
        if (value !== undefined) {
          const destKeyStr = destKey as string;
          const arrayInfo = parseArrayPath(destKeyStr);

          if (arrayInfo) {
            // Handle array[index].field notation
            const { arrayPath, index, fieldPath } = arrayInfo;

            // Ensure array exists
            if (!out[arrayPath]) {
              out[arrayPath] = [];
            }

            // Ensure array has element at index
            if (!out[arrayPath][index]) {
              out[arrayPath][index] = {};
            }

            // Set the field in the array element
            setByPath(out[arrayPath][index], fieldPath, value);
          } else {
            // Handle regular path notation
            setByPath(out, destKeyStr, value);
          }
        }
      }
      // Apply defaults if not set by rules
      const defaults = mapping.defaults || {};
      for (const [destPath, defVal] of Object.entries(defaults)) {
        const curVal = getByPath(out, destPath);
        const isEmpty =
          curVal === undefined ||
          curVal === null ||
          (typeof curVal === "string" && curVal.trim() === "");
        if (isEmpty) setByPath(out, destPath, defVal);
      }
      break;
    }
  }

  return out;
}
