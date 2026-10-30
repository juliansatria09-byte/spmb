import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const cookieName = "spmb-server-session";
const sessionLifetimeSeconds = 60 * 60 * 12;
const secretKey = Symbol.for("spmb.server-session-secret");

function getSecret() {
  if (process.env.SPMB_SESSION_SECRET) return process.env.SPMB_SESSION_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SPMB_SESSION_SECRET wajib diatur untuk menjalankan sesi server di production.");
  }
  if (!globalThis[secretKey]) {
    globalThis[secretKey] = randomBytes(32).toString("hex");
    console.warn("SPMB_SESSION_SECRET belum diatur; sesi demo hanya berlaku selama proses server berjalan.");
  }
  return globalThis[secretKey];
}

function signature(payload) {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSessionToken(user) {
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    role: user.role,
    email: user.email,
    expiresAt: Date.now() + sessionLifetimeSeconds * 1000,
  })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function readServerSession(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader.split(";").map((item) => item.trim())
    .find((item) => item.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  if (!token) return null;

  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return null;
  const expectedSignature = signature(payload);
  const expectedBuffer = Buffer.from(expectedSignature);
  const suppliedBuffer = Buffer.from(suppliedSignature);
  if (expectedBuffer.length !== suppliedBuffer.length || !timingSafeEqual(expectedBuffer, suppliedBuffer)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!session.id || !["pelajar", "admin", "kepala"].includes(session.role) || session.expiresAt <= Date.now()) return null;
    return session;
  } catch (error) {
    console.error("Cookie sesi server memiliki isi yang tidak valid.", error);
    return null;
  }
}

export function applySessionCookie(response, user) {
  const token = createSessionToken(user);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.set(
    "Set-Cookie",
    `${cookieName}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${sessionLifetimeSeconds}${secure}`,
  );
  return response;
}

export function clearSessionCookie(response) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.set("Set-Cookie", `${cookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`);
  return response;
}
