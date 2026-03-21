import { NextRequest, NextResponse } from "next/server";
import { generatePDFBuffer } from "@/lib/pdf/generator";

interface GeneratePDFRequest {
  content: string;
  name?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GeneratePDFRequest;
    const { content, name } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const pdfBuffer = await generatePDFBuffer(content, name);

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
