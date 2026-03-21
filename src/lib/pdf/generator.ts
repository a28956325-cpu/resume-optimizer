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
 */
function groupIntoLines(
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

    let elementsAdded = 0;

    for (const { original, replacement } of replacements) {
      if (!original || !replacement || original === replacement) continue;

      const needle = original.trim().toLowerCase();

      for (const line of lines) {
        // Build the full line text (space-joined) and a per-item char-offset map
        let lineText = "";
        const offsets: Array<{ item: TextPosition; start: number }> = [];

        for (const item of line.items) {
          offsets.push({ item, start: lineText.length });
          lineText += item.text;
        }

        const lineTextLower = lineText.toLowerCase();
        const idx = lineTextLower.indexOf(needle);
        if (idx === -1) continue;

        // Find the items that overlap with [idx, idx+needle.length)
        const endIdx = idx + needle.length;
        const matchedItems = offsets.filter(({ item, start }) => {
          const end = start + item.text.length;
          return start < endIdx && end > idx;
        });

        if (matchedItems.length === 0) continue;

        // Bounding box of matched items
        const firstItem = matchedItems[0].item;
        const lastItem = matchedItems[matchedItems.length - 1].item;

        const bboxX = firstItem.x;
        const bboxY = firstItem.y; // PDF bottom-left origin
        const bboxW = lastItem.x + lastItem.width - firstItem.x;
        const bboxH = firstItem.height > 0 ? firstItem.height : firstItem.fontSize;
        const pageNum = line.pageIndex + 1; // iLovePDF pages are 1-indexed
        const fontSize = Math.round(firstItem.fontSize);

        // iLovePDF uses bottom-left origin (same as PDF), so coordinates
        // can be passed through directly.
        // The `pages` param is a stringified 1-indexed page number.
        const pagesStr = String(pageNum);

        // 1) White rectangle overlay (covers old text).
        //    Pass the uploaded BaseFile; the Image constructor reads
        //    file.serverFilename to reference the already-uploaded asset.
        const whiteRect = new ImageElement({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          file: uploadedWhiteFile as any,
          coordinates: { x: bboxX, y: bboxY },
          dimensions: {
            w: Math.ceil(bboxW) + WHITE_RECT_PADDING,
            h: Math.ceil(bboxH) + WHITE_RECT_PADDING,
          },
          pages: pagesStr,
          opacity: 100,
        });
        task.addElement(whiteRect);

        // 2) Replacement text drawn at the same baseline position.
        //    'Arial Unicode MS' is an iLovePDF server-side font that covers
        //    both Latin and CJK characters.
        const textEl = new TextElement({
          text: replacement,
          coordinates: { x: bboxX, y: bboxY },
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

        elementsAdded++;
        break; // Replace only the first occurrence per replacement entry
      }
    }

    if (elementsAdded === 0) {
      // Nothing to edit – fall back to the react-pdf generator
      console.warn(
        "editPDFWithILovePDF: no matching text positions found; falling back to react-pdf"
      );
      return generatePDFBuffer(optimizedContent, name);
    }

    await task.process();
    const resultData: Uint8Array = await task.download();
    return Buffer.from(resultData);
  } catch (error) {
    console.error("editPDFWithILovePDF error:", error);
    // Graceful fallback to react-pdf
    return generatePDFBuffer(optimizedContent, name);
  }
}