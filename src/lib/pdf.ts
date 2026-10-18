import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import sharp from "sharp";
import { getPrivate } from "./storage";
import type { StoryPage } from "./story";

// 8.5" square trim + 0.125" bleed on every side, in PDF points.
const TRIM = 612;
const BLEED = 9;
const SIZE = TRIM + BLEED * 2;
const SAFE = BLEED + 36;
const PRINT_DPI = 300;

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Standard PDF fonts only cover WinAnsi; replace typographic characters they can't encode. */
function pdfSafe(text: string) {
  return text.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, "...").replace(/[^\x20-\x7e\xa0-\xff]/g, "");
}

async function illustrationPng(page: StoryPage, widthPt: number, heightPt: number) {
  if (!page.illustrationKey) return null;
  const raw = await getPrivate(page.illustrationKey);
  const px = { width: Math.round((widthPt / 72) * PRINT_DPI), height: Math.round((heightPt / 72) * PRINT_DPI) };
  return sharp(raw, { density: 300 }).resize(px.width, px.height, { fit: "cover" }).png().toBuffer();
}

/** Builds a print-ready PDF (with bleed) for the print partner. */
export async function buildStoryPdf(params: { title: string; childName: string; pages: StoryPage[]; palette: { bg: string; accent: string } }) {
  const { title, childName, pages, palette } = params;
  const doc = await PDFDocument.create();
  doc.setTitle(pdfSafe(title));
  doc.setCreator("Kidzstories");
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);

  // Cover
  const cover = doc.addPage([SIZE, SIZE]);
  cover.drawRectangle({ x: 0, y: 0, width: SIZE, height: SIZE, color: hexToRgb(palette.bg) });
  if (pages[0]) {
    const art = await illustrationPng(pages[0], SIZE, SIZE * 0.62);
    if (art) cover.drawImage(await doc.embedPng(art), { x: 0, y: SIZE * 0.38, width: SIZE, height: SIZE * 0.62 });
  }
  const titleLines = wrap(pdfSafe(title), bold, 34, SIZE - SAFE * 2);
  titleLines.forEach((l, i) => {
    const w = bold.widthOfTextAtSize(l, 34);
    cover.drawText(l, { x: (SIZE - w) / 2, y: SIZE * 0.26 - i * 40, size: 34, font: bold, color: rgb(1, 0.97, 0.94) });
  });
  const byline = pdfSafe(`A Kidzstories book made for ${childName}`);
  cover.drawText(byline, { x: (SIZE - serif.widthOfTextAtSize(byline, 14)) / 2, y: SAFE, size: 14, font: serif, color: hexToRgb(palette.accent) });

  // Story pages: illustration on top, text below.
  for (let i = 0; i < pages.length; i++) {
    const page = doc.addPage([SIZE, SIZE]);
    page.drawRectangle({ x: 0, y: 0, width: SIZE, height: SIZE, color: rgb(1, 0.97, 0.94) });
    const artH = SIZE * 0.64;
    const art = await illustrationPng(pages[i], SIZE, artH);
    if (art) page.drawImage(await doc.embedPng(art), { x: 0, y: SIZE - artH, width: SIZE, height: artH });
    const lines = wrap(pdfSafe(pages[i].text), serif, 19, SIZE - SAFE * 2);
    lines.forEach((l, j) => page.drawText(l, { x: SAFE, y: SIZE - artH - 44 - j * 26, size: 19, font: serif, color: rgb(0.17, 0.14, 0.25) }));
    const num = String(i + 1);
    page.drawText(num, { x: SIZE / 2 - serif.widthOfTextAtSize(num, 11) / 2, y: SAFE - 18, size: 11, font: serif, color: rgb(0.5, 0.45, 0.55) });
  }

  // Back cover
  const back = doc.addPage([SIZE, SIZE]);
  back.drawRectangle({ x: 0, y: 0, width: SIZE, height: SIZE, color: hexToRgb(palette.bg) });
  const end = "The End";
  back.drawText(end, { x: (SIZE - bold.widthOfTextAtSize(end, 40)) / 2, y: SIZE / 2, size: 40, font: bold, color: rgb(1, 0.97, 0.94) });

  return Buffer.from(await doc.save());
}
