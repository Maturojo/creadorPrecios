import { useCallback, useEffect, useState } from "react";
import Productos from "./components/Productos";
import LoginScreen from "./components/auth/LoginScreen";
import { cerrarSesionGoogle, validarSesionGoogle } from "./services/auth";
import { getAuthToken } from "./services/api";
import "./styles/auth.css";

function App() {
  const [estadoSesion, setEstadoSesion] = useState("cargando");
  const [usuario, setUsuario] = useState(null);
  const [errorAcceso, setErrorAcceso] = useState(null);
  const [emailIntento, setEmailIntento] = useState("");

  const restaurarSesion = useCallback(async () => {
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

        <button type="button" className="btn-outline" onClick={handleLogout}>
          Cerrar sesion
        </button>
      </header>

      <Productos />
    </div>
  );
}

export default App;
