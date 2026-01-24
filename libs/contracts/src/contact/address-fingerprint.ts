/**
 * Returns a fingerprint for an address based on its normalized components.
 * @param {string} streetNormalized - normalized street
 * @param {string} street2Normalized - normalized street2
 * @param {string} cityNormalized - normalized city
 * @param {string} stateNormalized - normalized state
 * @param {string} postalCodeNormalized - normalized postal code
 * @param {string} countryNormalized - normalized country
 * @returns {string} - address fingerprint
 */
export function addressFingerprint(
  streetNormalized?: string,
  street2Normalized?: string,
  cityNormalized?: string,
  stateNormalized?: string,
  postalCodeNormalized?: string,
  countryNormalized?: string,
): string {
  return `${streetNormalized}|${street2Normalized}|${cityNormalized}|${stateNormalized}|${postalCodeNormalized}|${countryNormalized}`;
}