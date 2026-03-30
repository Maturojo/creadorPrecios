import { useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT_ID = "google-identity-services";

function cargarScriptGoogle() {
  return new Promise((resolve, reject) => {
    const existente = document.getElementById(GOOGLE_SCRIPT_ID);

    if (existente) {
      existente.addEventListener("load", resolve, { once: true });
      existente.addEventListener("error", reject, { once: true });

      if (window.google?.accounts?.id) {
        resolve();
      }

      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

const WHATSAPP_ADMIN = "5492234383262";

export default function LoginScreen({
  onLogin,
  cargando,
  estadoAcceso,
  emailIntento,
}) {
  const buttonRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

    if (!googleClientId) {
      setError(
        "Falta configurar VITE_GOOGLE_CLIENT_ID para habilitar el acceso con Google."
      );
      return undefined;
    }

    let activo = true;

    cargarScriptGoogle()
      .then(() => {
        if (!activo || !buttonRef.current || !window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async ({ credential }) => {
            if (!credential) {
              setError("Google no devolvio un token valido.");
              return;
            }

            try {
              setError("");
              await onLogin(credential);
            } catch (authError) {
              setError(authError.message || "No se pudo iniciar sesion.");
            }
          },
        });

        buttonRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: 300,
          text: "signin_with",
        });
      })
      .catch(() => {
        if (activo) {
          setError("No se pudo cargar el acceso con Google.");
        }
      });

    return () => {
      activo = false;
    };
  }, [onLogin]);

  const accesoDenegado = estadoAcceso === "denegado";
  const mensajeWhatsapp = encodeURIComponent(
    `Hola, solicito acceso a la app de precios de Sur Maderas.${
      emailIntento ? ` Mi Gmail es ${emailIntento}.` : ""
    } Quedo a la espera de confirmacion para autorizar el ingreso.`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_ADMIN}?text=${mensajeWhatsapp}`;

  return (
    <main className="login-screen">
      <section
        className={`login-card ${accesoDenegado ? "login-card--denied" : ""}`}
      >
        <div className="login-eyebrow">Sur Maderas</div>
        {accesoDenegado ? (
          <>
            <h1>Acceso denegado</h1>
            <p>
              Tu cuenta de Google no esta autorizada para entrar a esta app.
            </p>
            <div className="login-denied-box">
              <strong>Solicitud de autorizacion</strong>
              <p>
                Tu acceso fue denegado. Podes enviar ahora mismo un WhatsApp al
                admin de Sur Maderas para pedir autorizacion.
              </p>
            </div>
            <a
              className="login-whatsapp-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              Solicitar acceso por WhatsApp
            </a>
            <p className="login-note">
              Cuando tu cuenta sea autorizada, vas a poder ingresar normalmente
              con Google.
            </p>
          </>
        ) : (
          <>
            <h1>Acceso protegido</h1>
            <p>
              Inicia sesion con una cuenta de Google autorizada para ver y
              modificar precios.
            </p>

            <div className="google-login-slot">
              <div ref={buttonRef} />
            </div>

            {cargando ? (
              <p className="login-helper">Validando acceso...</p>
            ) : null}
            {error ? <p className="login-error">{error}</p> : null}

            <p className="login-note">
              Si tu cuenta no esta autorizada, el sistema no te va a dejar
              entrar.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
