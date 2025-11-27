// client/src/config.ts

// Backend base URL for API calls.
// In dev: leave undefined, default to "" (proxy).
// In production: set VITE_API_BASE_URL on Render to your backend URL.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

// Base URL used for short links (where /:code lives).
// In dev: http://localhost:4000
// In production: backend URL again.
export const SHORT_BASE =
  import.meta.env.VITE_SHORT_BASE_URL || API_BASE || window.location.origin;
