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
