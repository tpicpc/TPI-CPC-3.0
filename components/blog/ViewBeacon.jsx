"use client";

import { useEffect } from "react";

// Counts one read per browser session (for the admin "most-read blogs" chart).
export default function ViewBeacon({ id }) {
  useEffect(() => {
    if (!id) return;
    const key = `viewed:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    fetch(`/api/v1/blog/${id}/view`, { method: "POST", keepalive: true }).catch(() => {});
  }, [id]);
  return null;
}
