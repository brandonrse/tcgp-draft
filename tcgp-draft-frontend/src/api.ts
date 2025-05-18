const API_BASE = import.meta.env.VITE_API_URL || '';

export function apiFetch(path: string, options?: RequestInit) {
  // console.log('api fetch', path);
  return fetch(`${API_BASE}${path}`, options);
}