// Draw text that may contain Bangla into a pdf-lib page.
// pdf-lib's standard fonts are WinAnsi-only and fontkit mis-shapes Bengali
// conjuncts/vowel signs, so Bangla runs are shaped with HarfBuzz (WASM) and drawn
// as vector glyph outlines from the bundled Noto Bengali fonts (SIL OFL).
// Latin runs keep using the regular standard fonts, so the design is unchanged.
import { readFileSync } from "node:fs";
import path from "node:path";

const BN_RE = /[\u0980-\u09FF]/;
const RUN_RE = /([\u0980-\u09FF\u200C\u200D]+(?:[\s\u0964\u0965.,'"()\-–—:/]+[\u0980-\u09FF\u200C\u200D]+)*)/;

export const BANGLA_FONTS = {
  serif: "NotoSerifBengali-Bold.ttf",
  sans: "NotoSansBengali-Bold.ttf",
};

let hbPromise = null;
const loadHb = () => (hbPromise ||= import("harfbuzzjs"));
const fontCache = new Map();

async function hbFont(name) {
  if (fontCache.has(name)) return fontCache.get(name);
  const hb = await loadHb();
  const buf = readFileSync(path.join(process.cwd(), "lib", "fonts", name));
  const blob = new hb.Blob(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  const face = new hb.Face(blob, 0);
  const entry = { hb, font: new hb.Font(face), upem: face.upem };
  fontCache.set(name, entry);
  return entry;
}

// HarfBuzz paths are y-up font units; pdf-lib's drawSvgPath expects SVG (y-down).
const flipY = (d) =>
  d.replace(/([MLQCZ])([^MLQCZ]*)/g, (_, c, args) =>
    c + (args.trim() ? args.trim().split(/[\s,]+/).map(Number).map((n, i) => (i % 2 ? -n : n)).join(" ") : ""));

/** Strip what WinAnsi standard fonts can't encode (Latin-1 plus common typographic punctuation). */
const NOT_WIN_ANSI = /[^\x20-\x7E\xA0-\xFF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026\u20AC]/g;
export const latinSafe = (s = "") =>
  String(s).normalize("NFKC").replace(NOT_WIN_ANSI, (c) => c.normalize("NFKD").replace(NOT_WIN_ANSI, ""));

export const hasBangla = (s = "") => BN_RE.test(String(s));

/**
 * Lay out mixed text: returns { width, draw(page, x, y, color) } for the given size.
 * `latinFont` is an embedded pdf-lib standard font; `bnFont` a key of BANGLA_FONTS.
 */
export async function layoutMixed(text, { latinFont, bnFont = "sans", size }) {
  const parts = String(text || "").split(RUN_RE).filter((p) => p !== "");
  const runs = [];
  for (const p of parts) {
    if (BN_RE.test(p)) {
      const { hb, font, upem } = await hbFont(BANGLA_FONTS[bnFont]);
      const buffer = new hb.Buffer();
      buffer.addText(p);
      buffer.guessSegmentProperties();
      hb.shape(font, buffer);
      const k = size / upem;
      const infos = buffer.getGlyphInfos();
      const pos = buffer.getGlyphPositions();
      let x = 0;
      const glyphs = [];
      infos.forEach((g, i) => {
        const d = font.glyphToPath(g.codepoint);
        if (d) glyphs.push({ d: flipY(d), x: x + pos[i].xOffset * k, y: pos[i].yOffset * k });
        x += pos[i].xAdvance * k;
      });
      runs.push({ kind: "bn", width: x, glyphs, k });
    } else {
      const t = latinSafe(p);
      if (t) runs.push({ kind: "latin", text: t, width: latinFont.widthOfTextAtSize(t, size) });
    }
  }
  const width = runs.reduce((a, r) => a + r.width, 0);
  return {
    width,
    draw(page, x, y, color) {
      let cx = x;
      for (const r of runs) {
        if (r.kind === "latin") page.drawText(r.text, { x: cx, y, size, font: latinFont, color });
        else for (const g of r.glyphs) page.drawSvgPath(g.d, { x: cx + g.x, y: y + g.y, scale: r.k, color, borderWidth: 0 });
        cx += r.width;
      }
    },
  };
}

/** Largest size ≤ `size` (≥ min) at which the text fits in `maxWidth`. */
export async function fitMixed(text, opts, maxWidth, min = 10) {
  let size = opts.size;
  let l = await layoutMixed(text, { ...opts, size });
  while (size > min && l.width > maxWidth) {
    size -= 1;
    l = await layoutMixed(text, { ...opts, size });
  }
  return { ...l, size };
}
