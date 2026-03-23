import React from "react";
import path from "path";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { TextPosition } from "./parser";

// ─── Noto Sans TC font for Chinese character support ──────────────────────────
// Register two subsets: Latin (basic ASCII) + Traditional Chinese
// Font files are served from /public/fonts/ and resolved from the file system
// when running server-side in Next.js.
const FONTS_DIR = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "NotoSansTC",
  fonts: [
    {
      src: path.join(FONTS_DIR, "NotoSansTC-Latin.woff"),
      fontWeight: "normal",
    },
    {
      src: path.join(FONTS_DIR, "NotoSansTC-Regular.woff"),
      fontWeight: "normal",
    },
  ],
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    padding: 40,
    lineHeight: 1.4,
    color: "#1a1a1a",
    fontFamily: "NotoSansTC",
  },
  header: {
    marginBottom: 16,
    borderBottom: "2pt solid #2563eb",
    paddingBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 4,
    fontFamily: "NotoSansTC",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 4,
    borderBottom: "0.5pt solid #bfdbfe",
    paddingBottom: 2,
    fontFamily: "NotoSansTC",
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bulletDot: {
    width: 12,
    fontSize: 10,
    fontFamily: "NotoSansTC",
  },
  bulletText: {
    flex: 1,
    fontSize: 9.5,
    fontFamily: "NotoSansTC",
  },
  paragraph: {
    fontSize: 9.5,
    marginBottom: 3,
    fontFamily: "NotoSansTC",
  },
});

// ─── React-PDF document component ────────────────────────────────────────────

interface ResumePDFDocumentProps {
  content: string;
  name?: string;
}

export function ResumePDFDocument({
  content,
  name = "Resume",
}: ResumePDFDocumentProps) {
  const lines = content.split("\n").filter((l) => l.trim());

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.name }, name)
      ),
      React.createElement(
        View,
        { style: styles.section },
        ...lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;

          if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
            return React.createElement(
              View,
              { key: idx, style: styles.bullet },
              React.createElement(Text, { style: styles.bulletDot }, "•"),
              React.createElement(
                Text,
                { style: styles.bulletText },
                trimmed.replace(/^[•\-]\s*/, "")
              )
            );
          }

          if (trimmed === trimmed.toUpperCase() && trimmed.length > 2) {
            return React.createElement(
              Text,
              { key: idx, style: styles.sectionTitle },
              trimmed
            );
          }

          return React.createElement(
            Text,
            { key: idx, style: styles.paragraph },
            trimmed
          );
        })
      )
    )
  );
}

// ─── Fallback: generate a new PDF using react-pdf (Chinese-aware) ─────────────

export async function generatePDFBuffer(
  content: string,
  name?: string
): Promise<Buffer> {
  const { renderToBuffer } = await import("@react-pdf/renderer");
  const doc = React.createElement(ResumePDFDocument, { content, name });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(doc as any);
  return Buffer.from(buffer);
}

// ─── Coordinate/layout constants ─────────────────────────────────────────────

/** Tolerance in PDF points for grouping text items on the same baseline. */
const LINE_GROUPING_TOLERANCE = 2;

/**
 * Extra space (in PDF points) added on each side of the bounding box when
 * drawing the white cover rectangle, ensuring the old text is fully hidden.
 */
const WHITE_RECT_PADDING = 2;

/**
 * Multiplier applied to the matched text width when sizing the replacement
 * text element. The replacement may be longer than the original, so we allow
 * extra room to avoid clipping.
 */
const TEXT_WIDTH_MULTIPLIER = 3;

/** Extra height (in PDF points) added to the replacement text element. */
const TEXT_HEIGHT_PADDING = 4;

export interface TextReplacement {
  original: string;
  replacement: string;
}

/**
 * Groups consecutive TextPosition items that lie on the same horizontal line
 * (within a small tolerance) and on the same page, sorted left-to-right.
 * @internal
 */
export function groupIntoLines(
  items: TextPosition[]
): Array<{ pageIndex: number; pageHeight: number; items: TextPosition[] }> {
  type LineKey = string; // "pageIndex:roundedY"
  const lineMap = new Map<LineKey, TextPosition[]>();
  const lineOrder: LineKey[] = [];

  for (const item of items) {
    // Round Y to nearest LINE_GROUPING_TOLERANCE points to merge items on the same baseline
    const roundedY =
      Math.round(item.y / LINE_GROUPING_TOLERANCE) * LINE_GROUPING_TOLERANCE;
    const key: LineKey = `${item.pageIndex}:${roundedY}`;
    if (!lineMap.has(key)) {
      lineMap.set(key, []);
      lineOrder.push(key);
    }
    lineMap.get(key)!.push(item);
  }

  return lineOrder.map((key) => {
    const lineItems = lineMap.get(key)!.sort((a, b) => a.x - b.x);
    return {
      pageIndex: lineItems[0].pageIndex,
      pageHeight: lineItems[0].pageHeight,
      items: lineItems,
    };
  });
}

/**
 * Ratio used to estimate an average character width when a text item reports
 * zero or negative width. Empirically, a character's width is roughly 50% of
 * its font size for most common typefaces.
 */
const CHAR_WIDTH_ESTIMATE_RATIO = 0.5;

/**
 * Normalizes text for fuzzy matching by:
 * - Lowercasing
 * - Replacing Unicode curly quotes with ASCII equivalents
 * - Replacing em/en dashes with hyphens
 * - Removing common bullet symbols
 * - Collapsing all whitespace runs to a single space
 */
function normalizeForMatching(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B\u02BC]/g, "'") // curly single quotes
    .replace(/[\u201C\u201D\u201E\u201F\u00AB\u00BB]/g, '"') // curly double quotes
    .replace(/[\u2013\u2014\u2015\u2212]/g, "-") // en/em dash, minus sign
    .replace(
      /[•·▪▸►◆■□\u2022\u2023\u25E6\u2043\u2219\u25AA\u25CF\uF0B7]/g,
      ""
    ) // bullets
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Maps a position (`normPos`) in the whitespace-normalized version of string
 * `s` back to the corresponding position in the original (un-normalized) `s`.
 *
 * Normalization is defined as collapsing every run of `/\s+/` into a single
 * space.  Non-whitespace characters always map 1-to-1 between the two
 * representations; only whitespace runs differ.
 *
 * @param s       The original (un-normalized) string.
 * @param normPos The character index inside the normalized form of `s`.
 * @returns       The corresponding character index inside the original `s`.
 */
function normToOrigIdx(s: string, normPos: number): number {
  let norm = 0;
  let orig = 0;
  while (orig < s.length) {
    if (norm === normPos) return orig;
    if (/\s/.test(s[orig])) {
      // An entire whitespace run counts as one character in the normalized string
      while (orig < s.length && /\s/.test(s[orig])) {
        orig++;
      }
      norm++;
    } else {
      orig++;
      norm++;
    }
  }
  return orig;
}

/**
 * Minimal white 1×1 PNG (70 bytes).
 * Used as the fill image for white-rectangle overlay elements.
 */
const WHITE_PNG_BYTES = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADklEQVQI12P4z8BQDwAEgAF/QualIQAAAABJRU5ErkJggg==",
  "base64"
);

/**
 * Edits the original PDF in-place using the iLovePDF API:
 *   1. For each text replacement, find the position of the original text.
 *   2. Draw a white rectangle over the old text.
 *   3. Draw the replacement text at the same position.
 *
 * Falls back to `generatePDFBuffer` if no replacements are found or if an
 * error occurs during the API call.
 */
export async function editPDFWithILovePDF(
  originalPdfBuffer: Buffer,
  textPositions: TextPosition[],
  replacements: TextReplacement[],
  optimizedContent: string,
  name?: string
): Promise<Buffer> {
  try {
    const ILovePDFApi = (await import("@ilovepdf/ilovepdf-nodejs")).default;
    const ILovePDFFile = (
      await import("@ilovepdf/ilovepdf-nodejs/ILovePDFFile")
    ).default;
    const TextElement = (
      await import("@ilovepdf/ilovepdf-js-core/tasks/edit/Text")
    ).default;
    const ImageElement = (
      await import("@ilovepdf/ilovepdf-js-core/tasks/edit/Image")
    ).default;

    const publicKey = process.env.ILOVEPDF_PUBLIC_KEY!;
    const secretKey = process.env.ILOVEPDF_SECRET_KEY!;

    const api = new ILovePDFApi(publicKey, secretKey);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const task = api.newTask("editpdf") as any;
    await task.start();

    // Upload the original PDF
    const pdfFile = ILovePDFFile.fromArray(originalPdfBuffer, "resume.pdf");
    await task.addFile(pdfFile);

    // Build grouped lines for text search
    const lines = groupIntoLines(textPositions);

    // Upload a white PNG once; reuse the returned BaseFile for all white-rect overlays.
    // The Image element constructor reads file.serverFilename (camelCase) that is
    // populated by task.addFile() after the upload completes.
    const whitePngFile = ILovePDFFile.fromArray(WHITE_PNG_BYTES, "white.png");
    const uploadedWhiteFile = await task.addFile(whitePngFile);

    // Pre-build line data (text + per-item offsets) once so it can be reused
    // across all replacements and for cross-line matching.
    interface LineData {
      line: { pageIndex: number; pageHeight: number; items: TextPosition[] };
      lineText: string;
      offsets: Array<{ item: TextPosition; start: number }>;
    }

    const lineDataArray: LineData[] = lines.map((line) => {
      let lineText = "";
      const offsets: Array<{ item: TextPosition; start: number }> = [];

      for (const item of line.items) {
        // Insert a space when there is a visible gap between consecutive text items.
        if (lineText.length > 0) {
          const prevItem = offsets[offsets.length - 1].item;
          // Guard against zero/negative widths reported by some fonts/extractors.
          const prevWidth =
            prevItem.width > 0
              ? prevItem.width
              : prevItem.fontSize * prevItem.text.length * CHAR_WIDTH_ESTIMATE_RATIO;
          const prevEnd = prevItem.x + prevWidth;
          if (item.x - prevEnd > 1) {
            lineText += " ";
          }
        }
        offsets.push({ item, start: lineText.length });
        lineText += item.text;
      }

      return { line, lineText, offsets };
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[editPDF] Grouped lines:");
      for (const { line, lineText } of lineDataArray) {
        console.log(`  [page ${line.pageIndex}] "${lineText}"`);
      }
      console.log("[editPDF] Replacements to find:");
      for (const r of replacements) {
        console.log(`  needle: "${r.original}" -> "${r.replacement}"`);
      }
    }

    /** Helper: draw a white-rect + replacement-text pair for a matched region. */
    function applyReplacement(
      matchedItems: TextPosition[],
      pageIndex: number,
      pageHeight: number,
      replacementText: string
    ): void {
      const firstItem = matchedItems[0];
      const lastItem = matchedItems[matchedItems.length - 1];

      const bboxX = firstItem.x;
      // pdfjs Y increases downward from the top of the page; the topmost
      // (smallest) Y value is the start of the region.
      const bboxY = Math.min(firstItem.y, lastItem.y);
      const bboxW = lastItem.x + lastItem.width - firstItem.x;
      // Height spans from the top of the highest item to the bottom of the lowest.
      const topY = Math.max(
        firstItem.y + (firstItem.height > 0 ? firstItem.height : firstItem.fontSize),
        lastItem.y + (lastItem.height > 0 ? lastItem.height : lastItem.fontSize)
      );
      const bboxH = Math.max(topY - bboxY, Math.max(
        firstItem.height > 0 ? firstItem.height : firstItem.fontSize,
        lastItem.height > 0 ? lastItem.height : lastItem.fontSize
      ));

      // iLovePDF uses a bottom-up coordinate system (standard PDF coordinates),
      // while pdfjs reports Y from the top of the page.  Convert here.
      const ilovepdfY = pageHeight - bboxY - bboxH;

      const pagesStr = String(pageIndex + 1); // iLovePDF pages are 1-indexed
      const fontSize = Math.round(firstItem.fontSize);

      const whiteRect = new ImageElement({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        file: uploadedWhiteFile as any,
        coordinates: { x: bboxX, y: ilovepdfY },
        dimensions: {
          w: Math.ceil(bboxW) + WHITE_RECT_PADDING,
          h: Math.ceil(bboxH) + WHITE_RECT_PADDING,
        },
        pages: pagesStr,
        opacity: 100,
      });
      task.addElement(whiteRect);

      const textEl = new TextElement({
        text: replacementText,
        coordinates: { x: bboxX, y: ilovepdfY },
        dimensions: {
          w: Math.ceil(bboxW) * TEXT_WIDTH_MULTIPLIER,
          h: Math.ceil(bboxH) + TEXT_HEIGHT_PADDING,
        },
        pages: pagesStr,
        font_family: "Arial Unicode MS",
        font_size: fontSize > 0 ? fontSize : 10,
        font_color: "#000000",
      });
      task.addElement(textEl);
    }

    let elementsAdded = 0;

    for (const { original, replacement } of replacements) {
      if (!original || !replacement || original === replacement) continue;

      // needle: whitespace-normalized, lowercased original text
      const needle = original.trim().toLowerCase().replace(/\s+/g, " ");
      // normNeedle: fully normalized (unicode chars + whitespace)
      const normNeedle = normalizeForMatching(original.trim());

      let found = false;

      // ── Strategies 1–3: single-line matching ─────────────────────────────────
      for (const { line, lineText, offsets } of lineDataArray) {
        if (found) break;

        const lineTextLower = lineText.toLowerCase();

        let idx = -1;
        let endIdx = -1;

        // Strategy 1: direct substring match (highest accuracy)
        const s1 = lineTextLower.indexOf(needle);
        if (s1 !== -1) {
          idx = s1;
          endIdx = s1 + needle.length;
        }

        // Strategy 2: collapse whitespace on both sides
        if (idx === -1) {
          const normWs = lineTextLower.replace(/\s+/g, " ");
          const s2 = normWs.indexOf(needle);
          if (s2 !== -1) {
            idx = normToOrigIdx(lineTextLower, s2);
            endIdx = normToOrigIdx(lineTextLower, s2 + needle.length);
          }
        }

        // Strategy 3: full normalization (curly quotes, dashes, bullets + whitespace)
        if (idx === -1) {
          const normLine = normalizeForMatching(lineText);
          const s3 = normLine.indexOf(normNeedle);
          if (s3 !== -1) {
            // Cannot easily map positions back through full normalization, so use
            // the entire line's item range as the bounding region.
            idx = 0;
            endIdx = lineText.length;
          }
        }

        if (idx === -1) continue;

        const matchedItems = offsets
          .filter(({ item, start }) => {
            const end = start + item.text.length;
            return start < endIdx && end > idx;
          })
          .map((o) => o.item);

        if (matchedItems.length === 0) continue;

        applyReplacement(matchedItems, line.pageIndex, line.pageHeight, replacement);
        elementsAdded++;
        found = true;
      }

      if (found) continue;

      // ── Strategy 4: cross-line matching (same page, adjacent lines) ───────────
      for (let li = 0; li < lineDataArray.length - 1; li++) {
        if (found) break;

        const ld1 = lineDataArray[li];
        const ld2 = lineDataArray[li + 1];

        // Only combine lines on the same page
        if (ld1.line.pageIndex !== ld2.line.pageIndex) continue;

        const combined = ld1.lineText.trimEnd() + " " + ld2.lineText.trimStart();
        const normCombined = normalizeForMatching(combined);

        if (normCombined.indexOf(normNeedle) === -1) continue;

        // Collect all items from both lines as the matched region.
        const matchedItems = [
          ...ld1.offsets.map((o) => o.item),
          ...ld2.offsets.map((o) => o.item),
        ];

        if (matchedItems.length === 0) continue;

        applyReplacement(matchedItems, ld1.line.pageIndex, ld1.line.pageHeight, replacement);
        elementsAdded++;
        found = true;
      }
    }

    if (elementsAdded === 0) {
      // Nothing to edit – return the original PDF unchanged
      console.warn(
        "editPDFWithILovePDF: no matching text positions found; returning original PDF"
      );
      return originalPdfBuffer;
    }

    await task.process();
    const resultData: Uint8Array = await task.download();
    return Buffer.from(resultData);
  } catch (error) {
    console.error("editPDFWithILovePDF error:", error);
    // Return the original PDF unchanged on error
    return originalPdfBuffer;
  }
}