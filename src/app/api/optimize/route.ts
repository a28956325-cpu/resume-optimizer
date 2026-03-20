import { NextRequest, NextResponse } from "next/server";
import type { OptimizationRequest, OptimizationResult } from "@/types/optimization";
import {
  findMatchedKeywords,
  findMissingKeywords,
  calculateMatchScore,
  extractKeywords,
} from "@/lib/utils/keywords";
import { isDemoMode } from "@/lib/ai/config";

function getMockResult(
  resumeText: string,
  jobDescription: string
): OptimizationResult {
  const keywords = extractKeywords(jobDescription).slice(0, 20);
  const matchedBefore = findMatchedKeywords(resumeText, keywords);
  const scoreBefore = calculateMatchScore(resumeText, keywords);

  const optimizedResume = resumeText
    .replace(/\bworked on\b/gi, "engineered")
    .replace(/\bhelped\b/gi, "collaborated on")
    .replace(/\bwas responsible for\b/gi, "led")
    .replace(/\bdid\b/gi, "executed")
    .replace(/\bmade\b/gi, "developed")
    .replace(/\bused\b/gi, "leveraged")
    .replace(/\bmanaged\b/gi, "orchestrated");

  const matchedAfter = findMatchedKeywords(optimizedResume, keywords);
  const scoreAfter = Math.min(
    100,
    calculateMatchScore(optimizedResume, keywords) + 8
  );
  const missing = findMissingKeywords(optimizedResume, keywords);

  return {
    originalResume: resumeText,
    optimizedResume,
    changes: [
      {
        original: "worked on backend services",
        optimized: "engineered backend services",
        reason: "Stronger action verb aligns with JD language",
        type: "verb_replacement",
        section: "Experience",
      },
      {
        original: "helped with deployment process",
        optimized: "collaborated on deployment process",
        reason: "More professional phrasing matching JD requirements",
        type: "verb_replacement",
        section: "Experience",
      },
      {
        original: "was responsible for database management",
        optimized: "led database management initiatives",
        reason: "Demonstrates ownership and leadership",
        type: "phrase_adjustment",
        section: "Experience",
      },
    ],
    keywordsMatched: matchedAfter,
    keywordsMissing: missing,
    matchScoreBefore: scoreBefore,
    matchScoreAfter: scoreAfter,
    summary:
      "Demo mode: Replaced weak action verbs with stronger alternatives aligned to the job description. In production mode with API keys, the AI will perform comprehensive ATS optimization.",
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as OptimizationRequest;
    const { resumeText, jobDescription, jobTitle, company } = body;

    if (!resumeText?.trim() || !jobDescription?.trim()) {
      return NextResponse.json(
        { error: "resumeText and jobDescription are required" },
        { status: 400 }
      );
    }

    // Demo mode when no API keys are configured
    if (isDemoMode()) {
      const result = getMockResult(resumeText, jobDescription);
      return NextResponse.json({ ...result, jobTitle, company });
    }

    // Real AI optimization
    const { analyzeJD } = await import("@/lib/ai/chains/jd-analyzer");
    const { optimizeResume } = await import("@/lib/ai/chains/resume-optimizer");

    // Step 1: Analyze JD
    const jdAnalysis = await analyzeJD(jobDescription);
    const allKeywords = [
      ...jdAnalysis.keywords.technical,
      ...jdAnalysis.keywords.industry,
      ...jdAnalysis.keywords.verbs,
      ...jdAnalysis.requiredSkills,
    ];

    // Step 2: Optimize resume
    const optimizationOutput = await optimizeResume(
      resumeText,
      jobDescription,
      allKeywords
    );

    // Step 3: Calculate scores
    const matchedBefore = findMatchedKeywords(resumeText, allKeywords);
    const matchedAfter = findMatchedKeywords(
      optimizationOutput.optimizedResume,
      allKeywords
    );
    const missing = findMissingKeywords(
      optimizationOutput.optimizedResume,
      allKeywords
    );

    const result: OptimizationResult = {
      originalResume: resumeText,
      optimizedResume: optimizationOutput.optimizedResume,
      changes: optimizationOutput.changes,
      keywordsMatched: matchedAfter,
      keywordsMissing: missing,
      matchScoreBefore: calculateMatchScore(resumeText, allKeywords),
      matchScoreAfter: calculateMatchScore(
        optimizationOutput.optimizedResume,
        allKeywords
      ),
      jobTitle: jobTitle ?? jdAnalysis.jobTitle,
      company: company ?? jdAnalysis.company,
      summary: optimizationOutput.summary,
    };

    // Save to DB if possible (non-critical, don't fail if DB is unavailable)
    try {
      const { prisma } = await import("@/lib/db/prisma");
      await prisma.optimization.create({
        data: {
          jobTitle: result.jobTitle ?? "",
          companyName: result.company ?? "",
          jobDescription,
          originalResume: resumeText,
          optimizedResume: result.optimizedResume,
          changes: JSON.parse(JSON.stringify(result.changes)),
          keywordsMatched: result.keywordsMatched,
          keywordsMissing: result.keywordsMissing,
          matchScoreBefore: result.matchScoreBefore,
          matchScoreAfter: result.matchScoreAfter,
          status: "completed",
        },
      });
    } catch {
      // DB not available — continue without saving
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Optimization error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Optimization failed",
      },
      { status: 500 }
    );
  }
}
