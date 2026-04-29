import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES = "7d";

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req) {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookieToken = req.cookies.get("tpi_token")?.value;
  return cookieToken || null;
}

export function requireAuth(req, requiredRole = null) {
  const token = getTokenFromRequest(req);
  if (!token) return { error: "Unauthorized", status: 401 };
  const payload = verifyToken(token);
  if (!payload) return { error: "Invalid token", status: 401 };
  if (requiredRole && payload.role !== requiredRole) {
    return { error: "Forbidden", status: 403 };
  }
  return { user: payload };
}

// Stricter check that also verifies the user account is still active.
// Use on routes that mutate state or grant content access; admins bypass.
export async function requireActiveUser(req) {
  const auth = requireAuth(req);
  if (auth.error) return auth;
  if (auth.user.role === "admin") return auth;

  const { connectDB } = await import("@/lib/db");
  const User = (await import("@/models/User")).default;
  await connectDB();
  const user = await User.findById(auth.user.id).select("status suspendedReason").lean();
  if (!user) return { error: "Account not found", status: 404 };
  if (user.status === "banned") {
    return { error: "Your account has been banned. Contact tpicpc@gmail.com.", status: 403, blocked: true };
  }
  if (user.status === "suspended") {
    return {
      error: user.suspendedReason ? `Account suspended: ${user.suspendedReason}` : "Your account is suspended.",
      status: 403,
      blocked: true,
    };
  }
  return auth;
}

export function authError(error, status) {
  return NextResponse.json({ success: false, message: error }, { status });
}

export async function getServerToken() {
  const store = await cookies();
  return store.get("tpi_token")?.value || null;
}
