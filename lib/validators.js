export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^\+?\d{10,15}$/;

export function isValidEmail(s) {
  return typeof s === "string" && emailRegex.test(s.trim());
}

export function passwordStrength(p) {
  if (!p || p.length < 6) return { ok: false, message: "Password must be at least 6 characters" };
  return { ok: true };
}

export function slugifyUsername(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w]+/g, "")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
}

export function isValidUsername(s) {
  return /^[a-z0-9_]{3,24}$/.test(s || "");
}

export function requireFields(obj, fields) {
  const missing = fields.filter((f) => obj[f] === undefined || obj[f] === null || obj[f] === "");
  return missing.length ? `Missing required fields: ${missing.join(", ")}` : null;
}
