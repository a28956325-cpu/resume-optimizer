import { NextRequest, NextResponse } from "next/server";
import { scrapeURL } from "@/lib/scraper/linkedin";

interface ParseJDRequest {
  type: "text" | "url";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ParseJDRequest;
    const { type, content } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    let jdText = content;

    if (type === "url") {
      jdText = await scrapeURL(content);
    }

    return NextResponse.json({ text: jdText });
  } catch (error) {
    console.error("Parse JD error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to parse job description",
      },
      { status: 500 }
    );
  }
}
