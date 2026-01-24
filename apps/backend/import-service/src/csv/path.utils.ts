/**
 * Utility functions for working with nested paths in objects.
 * Supports both dot notation (user.address.street) and bracket notation (addresses[0].street)
 */

/**
 * Gets a value from an object at the specified path.
 * @param {object} obj - source object
 * @param {string} path - dot/bracket notation path
 * @returns {any}
 * @example
 * getByPath({ user: { name: "John" } }, "user.name") => "John"
 * getByPath({ addresses: [{ street: "Main" }] }, "addresses[0].street") => "Main"
 */
export function getByPath(obj: any, path: string): any {
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
 * Creates intermediate objects/arrays as needed.
 * @param {object} obj - target object
 * @param {string} path - dot/bracket notation path
 * @param {any} value - value to set
 * @returns {void}
 * @example
 * const obj = {};
 * setByPath(obj, "user.name", "John"); // obj = { user: { name: "John" } }
 * setByPath(obj, "addresses[0].street", "Main"); // obj.addresses = [{ street: "Main" }]
 */
export function setByPath(obj: any, path: string, value: any): void {
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
 * @param {string} path - path string (e.g., "emails[0].email", "addresses[1].street")
 * @returns {Object|null} - { arrayPath, index, fieldPath } or null if not array notation
 * @example
 * parseArrayPath("emails[0].email") => { arrayPath: "emails", index: 0, fieldPath: "email" }
 * parseArrayPath("addresses[2].street") => { arrayPath: "addresses", index: 2, fieldPath: "street" }
 * parseArrayPath("firstName") => null
 */
export function parseArrayPath(
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
 * Checks if a path is using array notation
 * @param {string} path - path string
 * @returns {boolean}
 * @example
 * isArrayPath("emails[0].email") => true
 * isArrayPath("firstName") => false
 */
export function isArrayPath(path: string): boolean {
  return /\[\d+\]/.test(path);
}
