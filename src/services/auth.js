import { API_BASE_URL, apiFetch, setAuthToken } from "./api";

export async function validarSesionGoogle(token) {
  setAuthToken(token);

  const response = await apiFetch(`${API_BASE_URL}/auth/session`);

  if (!response.ok) {
    setAuthToken("");

    let message = "No se pudo validar la sesion";

    try {
      const data = await response.json();
      message = data.error || message;
    } catch {
      // sin cuerpo JSON
    }

    throw new Error(message);
  }

  const data = await response.json();
  return data.user;
}

export function cerrarSesionGoogle() {
  setAuthToken("");
}
