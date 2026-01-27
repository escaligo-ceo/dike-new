/**
 * API Configuration
 * Loads API endpoints from environment variables
 */

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_GATEWAY_URL || 'http://api.dike.cloud',
  timeout: 30000,
} as const;

export default API_CONFIG;
