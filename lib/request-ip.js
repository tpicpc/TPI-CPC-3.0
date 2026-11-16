/** Best-effort client IP for a Next.js route handler request (Vercel / proxies aware). */
export function getClientIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0].trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip");
  if (real) return real.trim();
  return req.ip || "";
}

export function getUserAgent(req) {
  return (req.headers.get("user-agent") || "").slice(0, 400);
}
