import { NextRequest, NextResponse } from "next/server";
import { generatePDFBuffer, editPDFWithILovePDF } from "@/lib/pdf/generator";
import type { TextReplacement } from "@/lib/pdf/generator";
import { isILovePDFConfigured } from "@/lib/ai/config";

interface GeneratePDFRequest {
  content: string;
  name?: string;
  /** Base64-encoded original PDF to edit in-place (optional) */
  originalPdfBase64?: string;
  /** Text replacements for iLovePDF in-place editing (optional) */
  replacements?: TextReplacement[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GeneratePDFRequest;
    const { content, name, originalPdfBase64, replacements } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    let pdfBuffer: Buffer;

    // Use iLovePDF in-place editing when:
    //   • iLovePDF API keys are configured
    //   • an original PDF was provided
    //   • there are replacements to apply
    if (
      isILovePDFConfigured() &&
      originalPdfBase64 &&
      replacements &&
      replacements.length > 0
    ) {
      const { extractTextWithPositions } = await import("@/lib/pdf/parser");
      const originalPdfBuffer = Buffer.from(originalPdfBase64, "base64");
      const textPositions = await extractTextWithPositions(originalPdfBuffer);

      pdfBuffer = await editPDFWithILovePDF(
        originalPdfBuffer,
        textPositions,
        replacements,
        content,
        name
      );
    } else {
      // Fallback: generate a brand-new PDF using react-pdf with Chinese font support
      pdfBuffer = await generatePDFBuffer(content, name);
    }

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="optimized-resume.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Generate PDF error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
