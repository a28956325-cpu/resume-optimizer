import { NextRequest, NextResponse } from "next/server";
import { parsePDF } from "@/lib/pdf/parser";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = await parsePDF(buffer);

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from PDF. The file may be scanned or image-based." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text: text.trim(),
      fileName: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("Parse resume error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume" },
      { status: 500 }
    );
  }
}
