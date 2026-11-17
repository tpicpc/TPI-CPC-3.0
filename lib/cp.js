// Competitive-programming integrations: upcoming contests + handle stats.
// All network calls are cached (memory + MongoDB) and fail soft: a broken source
// never breaks the page, it is just reported in `errors`.
import { connectDB } from "@/lib/db";
import CacheEntry from "@/models/CacheEntry";
import HandleStat from "@/models/HandleStat";

const UA = { "User-Agent": "Mozilla/5.0 (compatible; TPI-CPC-Website/1.0; +https://tpicpc.com)" };
const CONTESTS_TTL_MS = 30 * 60 * 1000; // 30 minutes
const STATS_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const mem = new Map();

async function fetchWithTimeout(url, { timeout = 8000, json = true } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { headers: UA, signal: ctrl.signal, cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return json ? await res.json() : await res.text();
  } finally {
    clearTimeout(t);
  }
}

// ---------------------------------------------------------------- contests

async function codeforcesContests() {
  const data = await fetchWithTimeout("https://codeforces.com/api/contest.list?gym=false");
  if (data.status !== "OK") throw new Error(data.comment || "Codeforces API error");
  return data.result
    .filter((c) => c.phase === "BEFORE" || c.phase === "CODING")
    .map((c) => ({
      id: `cf-${c.id}`,
      platform: "codeforces",
      name: c.name,
      url: `https://codeforces.com/contests/${c.id}`,
      start: new Date(c.startTimeSeconds * 1000).toISOString(),
      durationMinutes: Math.round(c.durationSeconds / 60),
      live: c.phase === "CODING",
    }));
}

async function codechefContests() {
  const data = await fetchWithTimeout(
    "https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&offset=0&mode=all"
  );
  const list = [...(data.present_contests || []).map((c) => ({ ...c, _live: true })), ...(data.future_contests || [])];
  return list.map((c) => ({
    id: `cc-${c.contest_code}`,
    platform: "codechef",
    name: c.contest_name,
    url: `https://www.codechef.com/${c.contest_code}`,
    start: new Date(c.contest_start_date_iso).toISOString(),
    durationMinutes: Number(c.contest_duration) || null,
    live: !!c._live,
  }));
}

async function atcoderContests() {
  // AtCoder has no official API; parse the public "Upcoming Contests" table.
  const html = await fetchWithTimeout("https://atcoder.jp/contests/?lang=en", { json: false });
  const section = html.split('id="contest-table-upcoming"')[1]?.split("</table>")[0] || "";
  const rows = section.split("<tr>").slice(2);
  return rows
    .map((row) => {
      const time = row.match(/<time[^>]*>([^<]+)<\/time>/)?.[1];
      const link = row.match(/<a href="(\/contests\/[^"]+)">([^<]+)<\/a>/);
      const dur = row.match(/<td class="text-center">(\d+):(\d+)<\/td>/);
      if (!time || !link) return null;
      const iso = time.trim().replace(" ", "T").replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
      return {
        id: `ac-${link[1].split("/").pop()}`,
        platform: "atcoder",
        name: link[2].trim(),
        url: `https://atcoder.jp${link[1]}`,
        start: new Date(iso).toISOString(),
        durationMinutes: dur ? Number(dur[1]) * 60 + Number(dur[2]) : null,
        live: false,
      };
    })
    .filter(Boolean);
}

const SOURCES = { codeforces: codeforcesContests, codechef: codechefContests, atcoder: atcoderContests };

async function readCache(key) {
  const m = mem.get(key);
  if (m && m.expiresAt > Date.now()) return m.data;
  try {
    await connectDB();
    const row = await CacheEntry.findOne({ key }).lean();
    if (row) {
      mem.set(key, { data: row.data, expiresAt: new Date(row.expiresAt).getTime() });
      if (new Date(row.expiresAt).getTime() > Date.now()) return row.data;
      return { ...row.data, stale: true };
    }
  } catch {}
  return null;
}

async function writeCache(key, data, ttl) {
  const expiresAt = Date.now() + ttl;
  mem.set(key, { data, expiresAt });
  try {
    await connectDB();
    await CacheEntry.updateOne({ key }, { data, expiresAt: new Date(expiresAt) }, { upsert: true });
  } catch {}
}

/** Upcoming contests from all platforms, sorted by start time. */
export async function getUpcomingContests({ force = false } = {}) {
  const key = "contests:upcoming:v1";
  const cached = force ? null : await readCache(key);
  if (cached && !cached.stale) return cached;

  const results = await Promise.allSettled(Object.values(SOURCES).map((fn) => fn()));
  const errors = {};
  let contests = [];
  Object.keys(SOURCES).forEach((platform, i) => {
    const r = results[i];
    if (r.status === "fulfilled") contests.push(...r.value);
    else {
      errors[platform] = r.reason?.message || "Unavailable";
      // keep the last known contests from this platform if the source is down
      if (cached?.contests) contests.push(...cached.contests.filter((c) => c.platform === platform));
    }
  });
  const now = Date.now();
  contests = contests
    .filter((c) => c.live || new Date(c.start).getTime() + (c.durationMinutes || 0) * 60000 > now)
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  const data = { contests, errors, fetchedAt: new Date().toISOString() };
  // If everything failed, retry sooner
  await writeCache(key, data, Object.keys(errors).length === 3 ? 5 * 60 * 1000 : CONTESTS_TTL_MS);
  return data;
}

// ---------------------------------------------------------------- handle stats

async function codeforcesStats(handle) {
  const info = await fetchWithTimeout(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`);
  if (info.status !== "OK") throw new Error(info.comment || "Handle not found");
  const u = info.result[0];
  let solved = null;
  try {
    const st = await fetchWithTimeout(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}`, { timeout: 12000 });
    if (st.status === "OK") {
      const set = new Set();
      for (const s of st.result) if (s.verdict === "OK" && s.problem) set.add(`${s.problem.contestId}-${s.problem.index}`);
      solved = set.size;
    }
  } catch {}
  return {
    displayHandle: u.handle,
    rating: u.rating ?? null,
    maxRating: u.maxRating ?? null,
    rank: u.rank || "unrated",
    solved,
  };
}

async function codechefStats(handle) {
  const html = await fetchWithTimeout(`https://www.codechef.com/users/${encodeURIComponent(handle)}`, { json: false, timeout: 10000 });
  const all = html.match(/all_rating\s*=\s*(\[[\s\S]*?\]);/);
  let rating = null;
  let contests = null;
  if (all) {
    try {
      const arr = JSON.parse(all[1]);
      contests = arr.length;
      if (arr.length) rating = Number(arr[arr.length - 1].rating) || null;
    } catch {}
  }
  if (!all && !/user-details-container|user-profile-container/.test(html)) throw new Error("Handle not found");
  const max = html.match(/Highest Rating\s*(\d+)/);
  const solved = html.match(/Total Problems Solved:\s*(\d+)/);
  const starBlock = html.match(/class="rating-star">([\s\S]*?)<\/div>/);
  const stars = starBlock ? [null, (starBlock[1].match(/&#9733;|★/g) || []).length || null] : null;
  if (rating == null) {
    const num = html.match(/class="rating-number">\s*(\d+)/);
    if (num) rating = Number(num[1]);
  }
  return {
    displayHandle: handle,
    rating,
    maxRating: max ? Number(max[1]) : rating,
    rank: stars?.[1] ? `${stars[1]}★` : "",
    solved: solved ? Number(solved[1]) : null,
    contests,
  };
}

async function atcoderStats(handle) {
  const hist = await fetchWithTimeout(`https://atcoder.jp/users/${encodeURIComponent(handle)}/history/json`);
  if (!Array.isArray(hist)) throw new Error("Handle not found");
  const rated = hist.filter((h) => h.IsRated);
  const last = rated[rated.length - 1];
  return {
    displayHandle: handle,
    rating: last ? last.NewRating : null,
    maxRating: rated.length ? Math.max(...rated.map((h) => h.NewRating)) : null,
    rank: "",
    solved: null,
    contests: rated.length,
  };
}

const STAT_FETCHERS = { codeforces: codeforcesStats, codechef: codechefStats, atcoder: atcoderStats };

/** Cached stats for one handle. Refreshes in the background-ish (awaited) when stale. */
export async function getHandleStats(platform, handle, { force = false } = {}) {
  if (!handle || !STAT_FETCHERS[platform]) return null;
  const h = handle.trim().toLowerCase();
  await connectDB();
  const cached = await HandleStat.findOne({ platform, handle: h }).lean();
  if (!force && cached && Date.now() - new Date(cached.fetchedAt).getTime() < STATS_TTL_MS) return cached;
  try {
    const fresh = await STAT_FETCHERS[platform](handle.trim());
    return await HandleStat.findOneAndUpdate(
      { platform, handle: h },
      { ...fresh, ok: true, error: "", fetchedAt: new Date() },
      { upsert: true, new: true }
    ).lean();
  } catch (e) {
    if (cached) return { ...cached, stale: true };
    return await HandleStat.findOneAndUpdate(
      { platform, handle: h },
      { ok: false, error: e.message || "Unavailable", fetchedAt: new Date() },
      { upsert: true, new: true }
    ).lean();
  }
}

/** Stats for all of a user's handles. */
export async function getUserCpStats(user, opts) {
  const handles = user?.handles || {};
  const out = {};
  await Promise.all(
    Object.keys(STAT_FETCHERS).map(async (p) => {
      if (handles[p]) out[p] = await getHandleStats(p, handles[p], opts);
    })
  );
  return out;
}

/**
 * Codeforces auto-verification: did `handle` get an accepted verdict on
 * contestId/index at or after `since`?
 */
export async function cfSolvedSince(handle, contestId, index, since) {
  const data = await fetchWithTimeout(
    `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=500`,
    { timeout: 12000 }
  );
  if (data.status !== "OK") throw new Error(data.comment || "Codeforces API error");
  const t = since ? new Date(since).getTime() / 1000 : 0;
  return data.result.find(
    (s) =>
      s.verdict === "OK" &&
      s.problem?.contestId === Number(contestId) &&
      String(s.problem?.index).toUpperCase() === String(index).toUpperCase() &&
      s.creationTimeSeconds >= t
  ) || null;
}

export const PLATFORM_META = {
  codeforces: { label: "Codeforces", profile: (h) => `https://codeforces.com/profile/${h}` },
  codechef: { label: "CodeChef", profile: (h) => `https://www.codechef.com/users/${h}` },
  atcoder: { label: "AtCoder", profile: (h) => `https://atcoder.jp/users/${h}` },
};
