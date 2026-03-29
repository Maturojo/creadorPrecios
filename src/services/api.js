const PRODUCTOS_API_URL = (
  import.meta.env.VITE_API_URL?.trim() ||
  (import.meta.env.DEV ? "http://localhost:4000/api/productos" : "/api/productos")
).replace(/\/$/, "");

export const API_BASE_URL = PRODUCTOS_API_URL.replace(/\/productos$/, "");
export const PRODUCTOS_API_BASE_URL = PRODUCTOS_API_URL;
export const AUTH_TOKEN_KEY = "precios_google_token";

export function getAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY) || "";
}

export function setAuthToken(token) {
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }

  return response;
}
