import { inspect as utilInspect } from "util";

const MAX_DEPTH = 5;

export function hideSensitiveData(
  obj: any,
  depth: number = 0,
  maxDepth: number = MAX_DEPTH
): any {
  // Prevent deep recursion beyond maxDepth levels
  if (depth >= maxDepth) {
    return obj;
  }

  if (obj === null) return obj;

  const sensitiveKeys = [
    "password",
    "token",
    "apiKey",
    "secret",
    "ssn",
    "creditCard",
    "iban",
    "pin",
    "accessToken",
    "access_token",
    "refreshToken",
    "refresh_token",
    "link",
    "verificationUrl",
    "access_token",
    "refresh_token",
    "id_token",
  ];

  let isUrlSearchParamsString = false;
  const parsedObj =
    typeof obj === "string" && obj.includes("=")
      ? (() => {
          try {
            const params = new URLSearchParams(obj);
            const entries = Array.from(params.entries());
            if (entries.length > 0) {
              isUrlSearchParamsString = true;
              return params;
            }
            return obj;
          } catch {
            return obj;
          }
        })()
      : obj;

  if (typeof parsedObj !== "object") return parsedObj;

  // Special handling for URLSearchParams - convert to masked query string if input was a string
  if (parsedObj instanceof URLSearchParams) {
    const result: any = {};
    for (const [key, value] of parsedObj.entries()) {
      if (sensitiveKeys.includes(key)) {
        result[key] = value !== undefined ? "***" : undefined;
      } else {
        result[key] = value;
      }
    }
    if (isUrlSearchParamsString) {
      // Ricostruisci la query string mascherata
      return Object.entries(result)
        .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join(",") : v}`)
        .join("&");
    }
    return result;
  }

  if (Array.isArray(parsedObj)) {
    return parsedObj.map((item) => {
      // Regola aggiuntiva: se l'oggetto ha type === 'password' e una prop value, oscura value
      if (
        item &&
        typeof item === "object" &&
        item.type === "password" &&
        Object.prototype.hasOwnProperty.call(item, "value")
      ) {
        return {
          ...item,
          value: item.value !== undefined ? "***" : undefined, // Hide sensitive data
        };
      }
      return hideSensitiveData(item, depth + 1, maxDepth);
    });
  }

  const result: any = Array.isArray(parsedObj) ? [] : {};
  for (const key of Object.keys(parsedObj)) {
    const value = parsedObj[key];
    // Se la proprietà è una stringa e sembra una query string, maschera i parametri sensibili
    if (
      typeof value === "string" &&
      value.includes("=") &&
      value.includes("&")
    ) {
      // Se è una URL completa con query string, maschera solo la parte query
      try {
        const urlObj = new URL(value);
        if (urlObj.search) {
          const maskedQuery = hideSensitiveData(
            urlObj.search.slice(1),
            0,
            maxDepth
          );
          urlObj.search = "?" + maskedQuery;
          result[key] = urlObj.toString();
          continue;
        }
      } catch {
        // Non è una URL completa, prova come query string pura
        try {
          const params = new URLSearchParams(value);
          const entries = Array.from(params.entries());
          if (entries.length > 0) {
            result[key] = hideSensitiveData(params, 0, maxDepth);
            continue;
          }
        } catch {
          // Non è una query string valida, prosegui normale
        }
      }
    }
    if (sensitiveKeys.includes(key)) {
      result[key] = value !== undefined ? "***" : undefined; // Hide sensitive data
    } else {
      result[key] = hideSensitiveData(value, depth + 1, maxDepth);
    }
  }
  return result;
}

/**
 * Inspect an object, hiding sensitive data.
 * @param {any} obj - Object to inspect
 * @param {boolean} shouldHideSensitiveData - Whether to hide sensitive data
 * @param {number} maxDepth - Maximum depth to inspect
 * @returns {string} - Inspected string
 */
export function inspect(
  obj: any,
  shouldHideSensitiveData: boolean = true,
  maxDepth?: number
): string {
  const options = { compact: false, depth: 5, breakLength: 80 };
  const masked = shouldHideSensitiveData
    ? hideSensitiveData(obj, 0, maxDepth)
    : obj;

  // Se la stringa mascherata è una query string, restituiscila direttamente
  if (
    typeof masked === "string" &&
    masked.includes("=") &&
    masked.includes("&")
  ) {
    return masked;
  }
  // Se è un oggetto con una proprietà stringa che è una URL con query string mascherata, restituisci come stringa JS
  if (typeof masked === "object" && masked !== null) {
    // Human-friendly Date rendering using system default format
    if (masked instanceof Date) {
      return masked.toString();
    }
    // Ricostruisci la stringa come util.inspect, ma senza apici per le URL
    const entries = Object.entries(masked).map(([k, v]) => {
      if (v instanceof Date) {
        return `${k}: ${v.toString()}`;
      }
      if (typeof v === "string" && v.startsWith("http") && v.includes("?")) {
        return `${k}: ${v}`;
      }
      return `${k}: ${utilInspect(v, options)}`;
    });
    return `{ ${entries.join(", ")} }`;
  }
  return utilInspect(masked, options);
}
