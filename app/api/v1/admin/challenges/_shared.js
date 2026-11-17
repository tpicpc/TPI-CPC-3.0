export const FIELDS = ["title", "description", "kind", "difficulty", "points", "platform", "problemUrl", "cfContestId", "cfIndex", "startsAt", "endsAt", "published", "statement", "sampleInput", "sampleOutput", "tags"];

export function prepare(d) {
  if (typeof d.tags === "string") d.tags = d.tags.split(",").map((t) => t.trim()).filter(Boolean);
  if (Array.isArray(d.tags)) d.tags = [...new Set(d.tags.map((t) => String(t).trim().slice(0, 24)).filter(Boolean))].slice(0, 8);
  if (d.points !== undefined) d.points = Math.max(0, Math.min(1000, Number(d.points) || 0));
  if (d.cfContestId !== undefined) d.cfContestId = d.cfContestId ? Number(d.cfContestId) : null;
  if (d.cfIndex !== undefined) d.cfIndex = String(d.cfIndex || "").toUpperCase().trim();
  // Auto-detect a Codeforces problem from its URL
  const m = String(d.problemUrl || "").match(/codeforces\.com\/(?:contest|problemset\/problem)\/(\d+)\/(?:problem\/)?([A-Za-z]\d?)/);
  if (m && !d.cfContestId) {
    d.cfContestId = Number(m[1]);
    d.cfIndex = m[2].toUpperCase();
  }
  if (!d.startsAt) delete d.startsAt; // keep the schema default (now) / existing value
  if (d.endsAt === "") d.endsAt = null;
  return d;
}
