"use client";

// Browser-side sanitizer for previews and the client fallback view.
import DOMPurify from "dompurify";
import { normalizeLegacyHtml } from "@/lib/blog-content";

export function sanitizeBlogHtmlClient(html = "") {
  if (typeof window === "undefined") return "";
  return DOMPurify.sanitize(normalizeLegacyHtml(html), {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "data-list"],
    FORBID_TAGS: ["style", "form", "input", "button"],
  });
}
