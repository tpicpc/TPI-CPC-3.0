// Shared helpers for server-side fetching of third-party public data
// (roadmap.sh, job feeds…): timeouts, a polite User-Agent and a two-level cache
// (memory + MongoDB CacheEntry) that keeps the last good copy when a source fails.
import { connectDB } from "@/lib/db";
import CacheEntry from "@/models/CacheEntry";

export const UA = "Mozilla/5.0 (compatible; TPI-CPC-Website/1.0; +https://tpicpc.com)";
const mem = new Map();

export async function fetchWithTimeout(url, { timeout = 10000, as = "json", headers = {} } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: as === "json" ? "application/json" : "*/*", ...headers },
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return as === "json" ? await res.json() : await res.text();
  } catch (e) {
    if (e?.name === "AbortError") throw new Error("Timed out");
    throw e;
  } finally {
    clearTimeout(t);
  }
}

/** Returns { data, expiresAt, updatedAt, fresh } or null. */
export async function readCache(key) {
  const m = mem.get(key);
  if (m && m.expiresAt > Date.now()) return { ...m, fresh: true };
  try {
    await connectDB();
    const row = await CacheEntry.findOne({ key }).lean();
    if (row) {
      const entry = { data: row.data, expiresAt: new Date(row.expiresAt).getTime(), updatedAt: new Date(row.updatedAt).getTime() };
      mem.set(key, entry);
      return { ...entry, fresh: entry.expiresAt > Date.now() };
    }
  } catch {}
  return m ? { ...m, fresh: false } : null;
}

export async function writeCache(key, data, ttlMs) {
  const entry = { data, expiresAt: Date.now() + ttlMs, updatedAt: Date.now() };
  mem.set(key, entry);
  try {
    await connectDB();
    await CacheEntry.updateOne({ key }, { data, expiresAt: new Date(entry.expiresAt) }, { upsert: true });
  } catch {}
  return entry;
}

/**
 * Cached loader with fail-soft semantics.
 * Fresh cache → returned as-is. Otherwise `loader()` runs; on failure the last good
 * copy is returned (marked stale) and retried after `retryMs`.
 * Result: { data, ok, stale, error, fetchedAt }
 */
export async function cachedFetch(key, loader, { ttlMs, retryMs = 15 * 60 * 1000, force = false } = {}) {
  const cached = await readCache(key);
  if (!force && cached?.fresh && cached.data?.__ok !== false) {
    return { data: cached.data.value, ok: true, stale: false, fetchedAt: cached.data.fetchedAt };
  }
  if (!force && cached?.fresh && cached.data?.__ok === false) {
    // recent failure: don't hammer the source, serve the last good copy if any
    return { data: cached.data.value, ok: false, stale: true, error: cached.data.error, fetchedAt: cached.data.fetchedAt };
  }
  try {
    const value = await loader();
    const fetchedAt = new Date().toISOString();
    await writeCache(key, { __ok: true, value, fetchedAt }, ttlMs);
    return { data: value, ok: true, stale: false, fetchedAt };
  } catch (e) {
    const error = e?.message || "Unavailable";
    const prev = cached?.data?.value ?? null;
    const fetchedAt = cached?.data?.fetchedAt ?? null;
    await writeCache(key, { __ok: false, value: prev, fetchedAt, error }, retryMs);
    return { data: prev, ok: false, stale: true, error, fetchedAt };
  }
}
