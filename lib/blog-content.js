// Helpers for blog HTML content. Isomorphic (no DOM / Node-only APIs) so they run
// in server components, route handlers and the browser editor alike.

const WORDS_PER_MINUTE = 225;

function decodeEntities(s = "") {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

/** Plain text from an HTML string (block boundaries become spaces). */
export function stripHtml(html = "") {
  return decodeEntities(
    String(html || "")
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<\/(p|div|h[1-6]|li|blockquote|pre|figcaption)>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(html = "") {
  const text = stripHtml(html);
  return text ? text.split(" ").length : 0;
}

/** Reading time in whole minutes (minimum 1). */
export function readingTime(html = "") {
  return Math.max(1, Math.round(countWords(html) / WORDS_PER_MINUTE));
}

/** A short plain-text summary, cut on a word boundary. */
export function excerpt(html = "", max = 160) {
  const text = stripHtml(html);
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ") > 60 ? cut.lastIndexOf(" ") : max).trimEnd().replace(/[,.;:!?-]+$/, "") + "…";
}

/**
 * Converts markup produced by the previous Quill 2 editor into standard HTML so
 * older posts render (and re-open in the new editor) correctly:
 *  - Quill 2 stores bullet lists as <ol><li data-list="bullet">
 *  - code blocks are <div class="ql-code-block-container"><div class="ql-code-block">line</div>…</div>
 *  - list items contain an empty <span class="ql-ui"> marker
 */
export function normalizeLegacyHtml(html = "") {
  let out = String(html || "");
  if (!out.includes("ql-") && !out.includes("data-list")) return out;

  out = out.replace(/<span class="ql-ui"[^>]*><\/span>/g, "");

  out = out.replace(/<ol>([\s\S]*?)<\/ol>/g, (match, inner) => {
    const bullet = /data-list="bullet"/.test(inner);
    const ordered = /data-list="ordered"/.test(inner);
    if (bullet && !ordered) return `<ul>${inner}</ul>`;
    return match;
  });

  out = out.replace(
    /<div class="ql-code-block-container"[^>]*>((?:\s*<div class="ql-code-block"[^>]*>[\s\S]*?<\/div>)*)\s*<\/div>/g,
    (_m, inner) => {
      const lines = [];
      inner.replace(/<div class="ql-code-block"[^>]*>([\s\S]*?)<\/div>/g, (_l, line) => {
        lines.push(line.replace(/<br\s*\/?>/g, ""));
        return "";
      });
      return `<pre><code>${lines.join("\n")}</code></pre>`;
    }
  );

  return out;
}

export function slugify(s = "") {
  return String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
