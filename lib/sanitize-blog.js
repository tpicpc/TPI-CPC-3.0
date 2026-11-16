// Server-side HTML sanitizer for blog content (stored HTML is user-submitted).
import sanitizeHtml from "sanitize-html";
import { normalizeLegacyHtml } from "@/lib/blog-content";

const OPTIONS = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "span", "div",
    "strong", "b", "em", "i", "u", "s", "strike", "del", "mark", "sub", "sup", "small",
    "a", "ul", "ol", "li", "blockquote", "pre", "code", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td", "iframe",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
    iframe: ["src", "width", "height", "allowfullscreen", "frameborder", "allow"],
    li: ["data-list"],
    code: ["class"],
    pre: ["class"],
    "*": ["class"],
  },
  allowedClasses: {
    "*": [/^ql-align-/, /^ql-indent-/, /^language-/],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
  transformTags: {
    a: (tagName, attribs) => {
      const external = /^https?:\/\//i.test(attribs.href || "");
      return {
        tagName,
        attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow" } : attribs,
      };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
  },
};

export function sanitizeBlogHtml(html = "") {
  return sanitizeHtml(normalizeLegacyHtml(html), {
    ...OPTIONS,
    allowedAttributes: { ...OPTIONS.allowedAttributes, img: [...OPTIONS.allowedAttributes.img, "loading"] },
  });
}
