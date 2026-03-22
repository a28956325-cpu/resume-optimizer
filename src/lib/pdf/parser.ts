export interface TextPosition {
  text: string;
  /** X position from left edge, in PDF points (bottom-left origin) */
  x: number;
  /** Y position from bottom edge, in PDF points (bottom-left origin) */
  y: number;
  /** Width of the text run in PDF points */
  width: number;
  /** Height (font size) in PDF points */
  height: number;
  /** Font size in PDF points */
  fontSize: number;
  /** 0-indexed page number */
  pageIndex: number;
  /** Page height in PDF points (used for coordinate conversion) */
  pageHeight: number;
}

/**
 * Returns true if the character is a CJK (Chinese/Japanese/Korean) character.
 * CJK text does not use spaces between characters, so gap-based space insertion
 * should be skipped when both adjacent characters are CJK.
 */
function isCJK(char: string): boolean {
  if (!char) return false;
  const code = char.codePointAt(0);
  if (code === undefined) return false;
  return (
    (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
    (code >= 0x20000 && code <= 0x2a6df) || // CJK Extension B
    (code >= 0xac00 && code <= 0xd7af) || // Korean Hangul Syllables
    (code >= 0x3040 && code <= 0x309f) || // Hiragana
    (code >= 0x30a0 && code <= 0x30ff) || // Katakana
    (code >= 0xff00 && code <= 0xffef) // Halfwidth/Fullwidth Forms
  );
}

/**
 * Reconstructs plain text from positioned text items, inserting spaces where
 * there are gaps between text runs on the same line and newlines between lines.
 *
 * Gap threshold: a gap wider than `fontSize * SPACE_THRESHOLD_RATIO` is treated
 * as a word space. Space insertion is skipped when both adjacent characters are
 * CJK (Chinese/Japanese/Korean text does not use inter-word spaces).
 *
 * Exported for unit-testing purposes.
 */
export function reconstructTextFromPositions(items: TextPosition[]): string {
  if (items.length === 0) return "";

  /** Points gap between two text runs that signals a word boundary. */
  const SPACE_THRESHOLD_RATIO = 0.3;
  /** Y-gap (relative to font size) that signals a paragraph/section break. */
  const PARAGRAPH_THRESHOLD_RATIO = 1.5;
  /** Tolerance in PDF points for grouping text items on the same baseline. */
  const LINE_TOLERANCE = 2;

  // ── Group items into lines per page ──────────────────────────────────────
  type LineKey = string; // `${pageIndex}:${roundedY}`
  const lineMap = new Map<LineKey, TextPosition[]>();
  const lineOrder: LineKey[] = [];

  for (const item of items) {
    const roundedY = Math.round(item.y / LINE_TOLERANCE) * LINE_TOLERANCE;
    const key: LineKey = `${item.pageIndex}:${roundedY}`;
    if (!lineMap.has(key)) {
      lineMap.set(key, []);
      lineOrder.push(key);
    }
    lineMap.get(key)!.push(item);
  }

  // ── Build sorted line objects ─────────────────────────────────────────────
  const lines = lineOrder.map((key) => {
    const lineItems = lineMap.get(key)!.sort((a, b) => a.x - b.x);
    const [pageIndexStr, roundedYStr] = key.split(":");
    return {
      pageIndex: parseInt(pageIndexStr, 10),
      y: parseInt(roundedYStr, 10),
      items: lineItems,
    };
  });

  // Sort lines top-to-bottom: by page index first, then by descending Y
  // (PDF coordinates have Y=0 at the bottom, so higher Y = higher on the page).
  lines.sort((a, b) => {
    if (a.pageIndex !== b.pageIndex) return a.pageIndex - b.pageIndex;
    return b.y - a.y;
  });

  // ── Reconstruct text ──────────────────────────────────────────────────────
  const resultLines: string[] = [];

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    let lineText = "";

    for (let i = 0; i < line.items.length; i++) {
      const item = line.items[i];
      if (i === 0) {
        lineText += item.text;
        continue;
      }

      const prev = line.items[i - 1];
      // Use actual width; fall back to an estimate when the PDF reports zero.
      const prevWidth =
        prev.width > 0
          ? prev.width
          : prev.fontSize * 0.5 * prev.text.length;
      const gap = item.x - (prev.x + prevWidth);
      const fontSize = Math.max(item.fontSize, prev.fontSize, 6);

      if (gap > fontSize * SPACE_THRESHOLD_RATIO) {
        // Skip space insertion between two adjacent CJK characters — CJK text
        // does not use spaces between characters.
        const lastChar = lineText[lineText.length - 1];
        const firstChar = item.text[0];
        const bothCJK = isCJK(lastChar) && isCJK(firstChar);
        if (!bothCJK) {
          lineText += " ";
        }
      }

      lineText += item.text;
    }

    // Insert an extra blank line before this line when there is a
    // significant vertical gap (paragraph break) or a page break.
    if (lineIdx > 0) {
      const prevLine = lines[lineIdx - 1];
      if (prevLine.pageIndex !== line.pageIndex) {
        resultLines.push("");
      } else {
        const avgFontSize =
          line.items.reduce((sum, it) => sum + it.fontSize, 0) /
          line.items.length;
        const yGap = prevLine.y - line.y; // positive = moving down the page
        if (yGap > avgFontSize * PARAGRAPH_THRESHOLD_RATIO) {
          resultLines.push("");
        }
      }
    }

    resultLines.push(lineText);
  }

  return resultLines.join("\n");
}

export async function parsePDF(buffer: Buffer): Promise<string> {
  // Primary approach: use pdfjs-dist position-aware extraction so that gaps
  // between text runs are translated into proper word spaces.  This fixes the
  // "all text concatenated without spaces" issue that affects certain PDFs when
  // using pdf-parse alone.
  const items = await extractTextWithPositions(buffer);
  if (items.length > 0) {
    return reconstructTextFromPositions(items);
  }

  // Fallback: extractTextWithPositions returned nothing (pdfjs error), so
  // try pdf-parse as a last resort.
  try {
    // Dynamic import to avoid webpack issues with pdf-parse
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF parse error:", error);
    throw new Error("Failed to parse PDF file");
  }
}

/**
 * Extracts text items with their positions from a PDF buffer.
 * Uses pdfjs-dist running in Node.js (no worker thread).
 * Returns an empty array on any pdfjs error so callers can fall back gracefully.
 */
export async function extractTextWithPositions(
  buffer: Buffer
): Promise<TextPosition[]> {
  try {
    // Dynamic import to avoid bundler issues; disable the worker for Node.js usage.
    // Use the legacy build which doesn't require browser APIs (e.g. DOMMatrix).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfjsLib = await import(
      "pdfjs-dist/legacy/build/pdf.mjs" as string
    ) as any;
    // Do NOT set GlobalWorkerOptions.workerSrc — let disableWorker handle it

    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      disableWorker: true,
      useWorkerFetch: false,
      isEvalSupported: false,
    });

    const pdf = await loadingTask.promise;
    const items: TextPosition[] = [];

    for (let pageIndex = 0; pageIndex < pdf.numPages; pageIndex++) {
      const page = await pdf.getPage(pageIndex + 1);
      const viewport = page.getViewport({ scale: 1.0 });
      const pageHeight = viewport.height;

      const textContent = await page.getTextContent();

      for (const item of textContent.items) {
        // Skip TextMarkedContent items (only process TextItem which has `str`)
        if (!("str" in item) || !item.str) continue;

        // transform = [scaleX, skewX, skewY, scaleY, translateX, translateY]
        const transform: number[] = item.transform;
        const x = transform[4];
        const y = transform[5];

        // Approximate font size from the scale component of the transform matrix
        const fontSize = Math.abs(transform[3]) || Math.abs(transform[0]) || 12;

        items.push({
          text: item.str,
          x,
          y,
          width: item.width,
          height: item.height > 0 ? item.height : fontSize,
          fontSize,
          pageIndex,
          pageHeight,
        });
      }
    }

    return items;
  } catch (error) {
    console.error("extractTextWithPositions error (returning empty array):", error);
    return [];
  }
}
