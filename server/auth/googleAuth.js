const { OAuth2Client } = require("google-auth-library");

function getGoogleClientId() {
  return (
    process.env.GOOGLE_CLIENT_ID ||
    process.env.VITE_GOOGLE_CLIENT_ID ||
    ""
  ).trim();
}

function getAllowedEmails() {
  return (process.env.ALLOWED_GOOGLE_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getBearerToken(req) {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return "";
  }

  return authorization.slice("Bearer ".length).trim();
}

async function verifyGoogleUserFromRequest(req) {
  const token = getBearerToken(req);

  if (!token) {
    const error = new Error("Falta el token de autenticacion");
    error.statusCode = 401;
    throw error;
  }

  const googleClientId = getGoogleClientId();

  if (!googleClientId) {
    const error = new Error("Falta GOOGLE_CLIENT_ID en variables de entorno");
    error.statusCode = 500;
    throw error;
  }

  const oauthClient = new OAuth2Client(googleClientId);
  const ticket = await oauthClient.verifyIdToken({
    idToken: token,
    audience: googleClientId,
  });
  const payload = ticket.getPayload();

  if (!payload?.email || !payload.email_verified) {
    const error = new Error("La cuenta de Google no es valida");
    error.statusCode = 401;
    throw error;
  }

  const email = payload.email.toLowerCase();
  const allowedEmails = getAllowedEmails();

  if (allowedEmails.length === 0) {
    const error = new Error("Falta ALLOWED_GOOGLE_EMAILS en variables de entorno");
    error.statusCode = 500;
    throw error;
  }

  if (!allowedEmails.includes(email)) {
    const error = new Error("Tu cuenta no tiene permiso para entrar");
    error.statusCode = 403;
    error.email = email;
    throw error;
  }

  return {
    email,
    nombre: payload.name || payload.given_name || email,
    imagenUrl: payload.picture || "",
  };
}

async function requireGoogleAuth(req, res, next) {
  try {
    req.authUser = await verifyGoogleUserFromRequest(req);
    next();
  } catch (error) {
    const statusCode = error.statusCode || 401;

    res.status(statusCode).json({
      error: error.message || "No autorizado",
      email: error.email || "",
    });
  }
}

module.exports = {
  getGoogleClientId,
  requireGoogleAuth,
  verifyGoogleUserFromRequest,
};
