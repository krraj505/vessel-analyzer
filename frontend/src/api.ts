export const API_BASE_URL = "http://localhost:8001";

function resolveUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(resolveUrl(path), init);
}
