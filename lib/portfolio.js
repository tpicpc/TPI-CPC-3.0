// Shared portfolio helpers (badges, field whitelist, sanitising).
export const PORTFOLIO_FIELDS = ["headline", "bio", "skills", "github", "linkedin", "facebook", "website", "handles", "emailNotifications"];

const clean = (v, max = 200) => String(v ?? "").trim().slice(0, max);
const HANDLE_RE = /^[A-Za-z0-9_.\-]{0,40}$/;

function normalizeUrl(v, host) {
  const s = clean(v, 300);
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  // allow bare usernames for github / linkedin / facebook
  if (host && /^[A-Za-z0-9_.\-]+$/.test(s)) return `https://${host}/${s}`;
  return `https://${s}`;
}

export function sanitizePortfolio(body = {}) {
  const out = {};
  if (body.headline !== undefined) out.headline = clean(body.headline, 120);
  if (body.bio !== undefined) out.bio = clean(body.bio, 600);
  if (body.skills !== undefined) {
    const arr = Array.isArray(body.skills) ? body.skills : String(body.skills).split(",");
    out.skills = [...new Set(arr.map((s) => clean(s, 30)).filter(Boolean))].slice(0, 20);
  }
  if (body.github !== undefined) out.github = normalizeUrl(body.github, "github.com");
  if (body.linkedin !== undefined) out.linkedin = normalizeUrl(body.linkedin, "linkedin.com/in");
  if (body.facebook !== undefined) out.facebook = normalizeUrl(body.facebook, "facebook.com");
  if (body.website !== undefined) out.website = normalizeUrl(body.website);
  if (body.emailNotifications !== undefined) out.emailNotifications = !!body.emailNotifications;
  if (body.handles && typeof body.handles === "object") {
    for (const p of ["codeforces", "codechef", "atcoder"]) {
      if (body.handles[p] === undefined) continue;
      const h = clean(body.handles[p], 40);
      if (!HANDLE_RE.test(h)) throw Object.assign(new Error(`Invalid ${p} handle`), { name: "ValidationError" });
      out[`handles.${p}`] = h;
    }
  }
  return out;
}

const CF_TITLES = [
  [3000, "Legendary Grandmaster"], [2600, "International Grandmaster"], [2400, "Grandmaster"],
  [2300, "International Master"], [2100, "Master"], [1900, "Candidate Master"],
  [1600, "Expert"], [1400, "Specialist"], [1200, "Pupil"], [0, "Newbie"],
];

/** Automatic achievement badges + admin-awarded ones. */
export function computeBadges({ user, stats = {}, blogs = 0, certificates = 0, challengesSolved = 0, eventsAttended = 0 }) {
  const out = [];
  const cf = stats.codeforces;
  if (cf?.maxRating) {
    const t = CF_TITLES.find(([r]) => cf.maxRating >= r);
    out.push({ label: `CF ${t[1]}`, tone: cf.maxRating >= 1900 ? "violet" : cf.maxRating >= 1400 ? "blue" : "green", icon: "trophy" });
  }
  const cc = stats.codechef;
  if (cc?.rank) out.push({ label: `CodeChef ${cc.rank}`, tone: "amber", icon: "star" });
  const solved = (cf?.solved || 0) + (stats.codechef?.solved || 0);
  if (solved >= 1000) out.push({ label: "1000+ problems", tone: "rose", icon: "flame" });
  else if (solved >= 500) out.push({ label: "500+ problems", tone: "rose", icon: "flame" });
  else if (solved >= 100) out.push({ label: "100+ problems", tone: "rose", icon: "flame" });
  if (blogs >= 1) out.push({ label: blogs >= 5 ? "Prolific writer" : "Writer", tone: "emerald", icon: "pen" });
  if (challengesSolved >= 1) out.push({ label: challengesSolved >= 10 ? "Challenge champion" : "Challenger", tone: "orange", icon: "target" });
  if (eventsAttended >= 3) out.push({ label: "Active member", tone: "sky", icon: "calendar" });
  if (certificates >= 1) out.push({ label: "Certified", tone: "indigo", icon: "award" });
  for (const b of user?.badges || []) out.push({ label: b, tone: "indigo", icon: "medal", awarded: true });
  return out;
}
