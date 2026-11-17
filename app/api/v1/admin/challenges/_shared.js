export const FIELDS = ["title", "description", "kind", "difficulty", "points", "platform", "problemUrl", "cfContestId", "cfIndex", "startsAt", "endsAt", "published"];

export function prepare(d) {
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
