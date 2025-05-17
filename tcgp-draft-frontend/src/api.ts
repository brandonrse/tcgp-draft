const API_BASE = process.env.VITE_API_URL || '';

export function apiFetch(path: string, options?: RequestInit) {
  console.log(API_BASE);
  return fetch(`${API_BASE}${path}`, options);
}