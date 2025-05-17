const API_BASE = process.env.VITE_API_URL || '';

export function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${API_BASE}${path}`, options);
}