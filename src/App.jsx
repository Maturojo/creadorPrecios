import { useCallback, useEffect, useState } from "react";
import Productos from "./components/Productos";
import LoginScreen from "./components/auth/LoginScreen";
import { cerrarSesionGoogle, validarSesionGoogle } from "./services/auth";
import { getAuthToken } from "./services/api";
import "./styles/auth.css";

const GOOGLE_AUTH_DESACTIVADO =
  String(import.meta.env.VITE_DISABLE_GOOGLE_AUTH || "").toLowerCase() ===
  "true";

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3m7 14 5-5m0 0-5-5m5 5H10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function App() {
  const [estadoSesion, setEstadoSesion] = useState("cargando");
  const [usuario, setUsuario] = useState(null);
  const [errorAcceso, setErrorAcceso] = useState(null);
  const [emailIntento, setEmailIntento] = useState("");

  const restaurarSesion = useCallback(async () => {
    if (GOOGLE_AUTH_DESACTIVADO) {
      setUsuario({
        nombre: "Acceso temporal habilitado",
        email: "auth-desactivado@surmaderas.local",
        imagenUrl: "",
      });
      setErrorAcceso(null);
      setEmailIntento("");
      setEstadoSesion("autenticado");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      setUsuario(null);
      setErrorAcceso(null);
      setEstadoSesion("anonimo");
      return;
    }

    try {
      const user = await validarSesionGoogle(token);
      setUsuario(user);
      setErrorAcceso(null);
      setEmailIntento(user?.email || "");
      setEstadoSesion("autenticado");
    } catch (error) {
      console.error(error);
      cerrarSesionGoogle();
      setUsuario(null);
      setEmailIntento(error.email || "");
      setErrorAcceso(
        error.code === "access_denied" ? "denegado" : "error-validacion"
      );
      setEstadoSesion("anonimo");
    }
  }, []);

  useEffect(() => {
    restaurarSesion();
  }, [restaurarSesion]);

  useEffect(() => {
    function handleUnauthorized() {
      cerrarSesionGoogle();
      setUsuario(null);
      setErrorAcceso(null);
      setEstadoSesion("anonimo");
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const handleLogin = useCallback(async (credential) => {
    if (GOOGLE_AUTH_DESACTIVADO) {
      setUsuario({
        nombre: "Acceso temporal habilitado",
        email: "auth-desactivado@surmaderas.local",
        imagenUrl: "",
      });
      setErrorAcceso(null);
      setEmailIntento("");
      setEstadoSesion("autenticado");
      return;
    }

    setEstadoSesion("validando");
    try {
      const user = await validarSesionGoogle(credential);
      setUsuario(user);
      setErrorAcceso(null);
      setEmailIntento(user?.email || "");
      setEstadoSesion("autenticado");
    } catch (error) {
      setUsuario(null);
      setEmailIntento(error.email || "");
      setErrorAcceso(
        error.code === "access_denied" ? "denegado" : "error-validacion"
      );
      setEstadoSesion("anonimo");
      throw error;
    }
  }, []);

  const handleLogout = useCallback(() => {
    if (GOOGLE_AUTH_DESACTIVADO) {
      setErrorAcceso(null);
      setEmailIntento("");
      return;
    }

    cerrarSesionGoogle();
    setUsuario(null);
    setErrorAcceso(null);
    setEmailIntento("");
    setEstadoSesion("anonimo");
  }, []);

  if (estadoSesion === "cargando" || estadoSesion === "validando") {
    return (
      <LoginScreen
        onLogin={handleLogin}
        cargando={estadoSesion === "validando"}
        estadoAcceso={errorAcceso}
        emailIntento={emailIntento}
      />
    );
  }

  if (estadoSesion !== "autenticado") {
    return (
      <LoginScreen
        onLogin={handleLogin}
        cargando={false}
        estadoAcceso={errorAcceso}
        emailIntento={emailIntento}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="session-bar">
        <div className="session-user">
          {usuario?.imagenUrl ? (
            <img
              src={usuario.imagenUrl}
              alt={usuario.nombre}
              className="session-avatar"
            />
          ) : (
            <div className="session-avatar session-avatar--fallback">
              {usuario?.nombre?.slice(0, 1) || "U"}
            </div>
          )}

          <div>
            <strong>{usuario?.nombre || "Usuario autorizado"}</strong>
            <span>{usuario?.email}</span>
          </div>
        </div>

        <div className="session-actions">
          <button
            type="button"
            className="session-icon-btn"
            onClick={handleLogout}
            aria-label="Cerrar sesion"
            title="Cerrar sesion"
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      <Productos />
    </div>
  );
}

export default App;
