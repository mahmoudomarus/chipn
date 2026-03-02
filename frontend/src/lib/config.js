/**
 * Application configuration.
 * Reads from Vite environment variables with sensible local defaults.
 */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
