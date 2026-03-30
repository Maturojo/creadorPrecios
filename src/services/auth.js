import { API_BASE_URL, apiFetch, setAuthToken } from "./api";

export async function validarSesionGoogle(token) {
  setAuthToken(token);

  const response = await apiFetch(`${API_BASE_URL}/auth/session`);

  if (!response.ok) {
    setAuthToken("");

    let message = "No se pudo validar la sesion";
    let email = "";

    try {
      const data = await response.json();
      message = data.error || message;
      email = data.email || "";
    } catch {
      // sin cuerpo JSON
    }

    const error = new Error(message);
    error.status = response.status;
    error.code = response.status === 403 ? "access_denied" : "auth_error";
    error.email = email;
    throw error;
  }

  const data = await response.json();
  return data.user;
}

export function cerrarSesionGoogle() {
  setAuthToken("");
}
