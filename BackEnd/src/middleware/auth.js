import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const TOKEN_TTL = process.env.AUTH_TOKEN_TTL || "1h";

let secretCache;
function resolveSecret() {
  if (secretCache) return secretCache;
  const configured = process.env.AUTH_TOKEN_SECRET || process.env.JWT_SECRET;
  if (configured && configured.trim()) {
    secretCache = configured.trim();
    return secretCache;
  }
  secretCache = crypto.randomBytes(32).toString("hex");
  if (process.env.NODE_ENV !== "test") {
    console.warn("[auth] AUTH_TOKEN_SECRET not set, using ephemeral secret. Tokens reset on restart.");
  }
  return secretCache;
}

function getAdminPassword() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || !pw.trim()) {
    throw Object.assign(new Error("ADMIN_PASSWORD is not configured"), {
      status: 500,
      code: "admin_password_not_configured",
    });
  }
  return pw;
}

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function handleAdminLogin(req, res) {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({
      error: { code: "bad_request", message: "username and password are required" },
    });
  }

  let expectedPassword;
  try {
    expectedPassword = getAdminPassword();
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      error: {
        code: err.code || "auth_not_configured",
        message: process.env.NODE_ENV === "production" ? "Authentication unavailable" : String(err.message || err),
      },
    });
  }

  if (username !== ADMIN_USERNAME || !timingSafeEqual(password, expectedPassword)) {
    return res.status(401).json({
      error: { code: "unauthorized", message: "Invalid credentials" },
    });
  }

  const token = jwt.sign({ sub: ADMIN_USERNAME, role: "admin" }, resolveSecret(), {
    expiresIn: TOKEN_TTL,
  });

  return res.json({
    token,
    user: {
      username: ADMIN_USERNAME,
      displayName: "Administrator",
      email: ADMIN_EMAIL,
      role: "admin",
    },
  });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: { code: "unauthorized", message: "Missing bearer token" } });
  }
  try {
    const payload = jwt.verify(token, resolveSecret());
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({
      error: {
        code: "unauthorized",
        message: process.env.NODE_ENV === "production" ? "Unauthorized" : String(err?.message || err),
      },
    });
  }
}

export function requireRole(role) {
  return function roleGuard(req, res, next) {
    const userRole = req.user?.role;
    if (userRole === role) return next();
    return res.status(403).json({ error: { code: "forbidden", message: "Insufficient privileges" } });
  };
}
