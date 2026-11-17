// Landscape A4 certificate PDF (pdf-lib, standard fonts, embedded verification QR).
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

const INDIGO = rgb(0.388, 0.4, 0.945);
const VIOLET = rgb(0.545, 0.361, 0.965);
const INK = rgb(0.067, 0.094, 0.153);
const MUTED = rgb(0.42, 0.45, 0.5);
const PALE = rgb(0.878, 0.894, 0.988);

// Standard PDF fonts are WinAnsi only — strip anything they can't encode.
const safe = (s = "") => String(s).normalize("NFKD").replace(/[^\x20-\x7E\xA0-\xFF]/g, "").trim();

function centered(page, text, y, font, size, color) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (page.getWidth() - w) / 2, y, size, font, color });
}

function fit(font, text, max, size) {
  let s = size;
  while (s > 10 && font.widthOfTextAtSize(text, s) > max) s -= 1;
  return s;
}

export async function renderCertificatePdf(cert, { baseUrl }) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Certificate ${cert.number}`);
  pdf.setAuthor("TPI CPC");
  pdf.setSubject(cert.referenceTitle);
  const page = pdf.addPage([842, 595]);
  const W = page.getWidth();
  const H = page.getHeight();

  const serif = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const serifIt = await pdf.embedFont(StandardFonts.TimesRomanBoldItalic);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const sansB = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Background + frames
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 0, y: H - 10, width: W / 2, height: 10, color: INDIGO });
  page.drawRectangle({ x: W / 2, y: H - 10, width: W / 2, height: 10, color: VIOLET });
  page.drawRectangle({ x: 0, y: 0, width: W / 2, height: 10, color: VIOLET });
  page.drawRectangle({ x: W / 2, y: 0, width: W / 2, height: 10, color: INDIGO });
  page.drawRectangle({ x: 24, y: 24, width: W - 48, height: H - 48, borderColor: PALE, borderWidth: 6 });
  page.drawRectangle({ x: 34, y: 34, width: W - 68, height: H - 68, borderColor: INDIGO, borderWidth: 0.8 });
  // corner accents
  for (const [x, y] of [[34, H - 34], [W - 34, H - 34], [34, 34], [W - 34, 34]]) {
    page.drawCircle({ x, y, size: 5, color: VIOLET });
  }

  const type = cert.type === "course" ? "COMPLETION" : "PARTICIPATION";
  centered(page, "TPI CPC  ·  COMPUTER & PROGRAMMING CLUB", H - 90, sansB, 10, INDIGO);
  centered(page, "Certificate", H - 145, serif, 50, INK);
  centered(page, `OF ${type}`, H - 172, sansB, 12, VIOLET);
  centered(page, "This certificate is proudly presented to", H - 215, sans, 12, MUTED);

  const name = safe(cert.recipientName) || "Member";
  const nameSize = fit(serifIt, name, W - 220, 40);
  centered(page, name, H - 265, serifIt, nameSize, INK);
  const nw = Math.min(serifIt.widthOfTextAtSize(name, nameSize) + 60, W - 200);
  page.drawLine({ start: { x: (W - nw) / 2, y: H - 278 }, end: { x: (W + nw) / 2, y: H - 278 }, thickness: 1, color: PALE });

  centered(page, cert.type === "course" ? "for successfully completing the course" : "for attending and participating in", H - 310, sans, 12, MUTED);
  const title = safe(cert.referenceTitle);
  centered(page, title, H - 340, sansB, fit(sansB, title, W - 220, 20), INK);
  if (cert.grade && cert.grade !== "Participation") centered(page, `Grade: ${safe(cert.grade)}`, H - 362, sans, 11, MUTED);

  // Footer: date · signature · QR
  const date = new Date(cert.issuedAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const fy = 110;
  page.drawLine({ start: { x: 110, y: fy }, end: { x: 290, y: fy }, thickness: 0.8, color: MUTED });
  page.drawText(date, { x: 200 - sansB.widthOfTextAtSize(date, 11) / 2, y: fy + 8, size: 11, font: sansB, color: INK });
  page.drawText("DATE OF ISSUE", { x: 200 - sans.widthOfTextAtSize("DATE OF ISSUE", 8) / 2, y: fy - 14, size: 8, font: sans, color: MUTED });

  const signer = safe(cert.instructor) || "TPI CPC";
  page.drawLine({ start: { x: 330, y: fy }, end: { x: 512, y: fy }, thickness: 0.8, color: MUTED });
  page.drawText(signer, { x: 421 - serifIt.widthOfTextAtSize(signer, 14) / 2, y: fy + 8, size: 14, font: serifIt, color: INK });
  const role = cert.type === "course" ? "INSTRUCTOR" : "ORGANIZER";
  page.drawText(role, { x: 421 - sans.widthOfTextAtSize(role, 8) / 2, y: fy - 14, size: 8, font: sans, color: MUTED });

  const verifyUrl = `${baseUrl.replace(/\/$/, "")}/certificate/${cert.number}`;
  const png = await QRCode.toBuffer(verifyUrl, { margin: 1, width: 240, color: { dark: "#111827", light: "#ffffff" } });
  const qr = await pdf.embedPng(png);
  page.drawImage(qr, { x: W - 190, y: 66, width: 80, height: 80 });
  page.drawText("Scan to verify", { x: W - 150 - sans.widthOfTextAtSize("Scan to verify", 8) / 2, y: 54, size: 8, font: sans, color: MUTED });

  const idLine = `Certificate ID: ${cert.number}`;
  centered(page, idLine, 50, sans, 8, MUTED);
  return pdf.save();
}
