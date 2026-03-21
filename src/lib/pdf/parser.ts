export async function parsePDF(buffer: Buffer): Promise<string> {
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
 * Extracts text items with their positions from a PDF buffer.
 * Uses pdfjs-dist running in Node.js (no worker thread).
 * Returns an empty array on any pdfjs error so callers can fall back gracefully.
 */
export async function extractTextWithPositions(
  buffer: Buffer
): Promise<TextPosition[]> {
  try {
    // Dynamic import to avoid bundler issues; disable the worker for Node.js usage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs" as string) as any;

    // Setting workerSrc to false (not an empty string) tells pdfjs to use the
    // fake/no-op worker, which works correctly in a Node.js / Next.js context.
    pdfjsLib.GlobalWorkerOptions.workerSrc = false;

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
