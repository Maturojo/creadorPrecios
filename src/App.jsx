import { useCallback, useEffect, useState } from "react";
import Productos from "./components/Productos";
import LoginScreen from "./components/auth/LoginScreen";
import { cerrarSesionGoogle, validarSesionGoogle } from "./services/auth";
import { getAuthToken } from "./services/api";
import "./styles/auth.css";

function App() {
  const [estadoSesion, setEstadoSesion] = useState("cargando");
  const [usuario, setUsuario] = useState(null);

  const restaurarSesion = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      setUsuario(null);
      setEstadoSesion("anonimo");
      return;
    }

    try {
      const user = await validarSesionGoogle(token);
      setUsuario(user);
      setEstadoSesion("autenticado");
    } catch (error) {
      console.error(error);
      cerrarSesionGoogle();
      setUsuario(null);
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
      setEstadoSesion("anonimo");
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const handleLogin = useCallback(async (credential) => {
    setEstadoSesion("validando");
    const user = await validarSesionGoogle(credential);
    setUsuario(user);
    setEstadoSesion("autenticado");
  }, []);

  const handleLogout = useCallback(() => {
    cerrarSesionGoogle();
    setUsuario(null);
    setEstadoSesion("anonimo");
  }, []);

  if (estadoSesion === "cargando" || estadoSesion === "validando") {
    return (
      <LoginScreen
        onLogin={handleLogin}
        cargando={estadoSesion === "validando"}
      />
    );
  }

  if (estadoSesion !== "autenticado") {
    return <LoginScreen onLogin={handleLogin} cargando={false} />;
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
