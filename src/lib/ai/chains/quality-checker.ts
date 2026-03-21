import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getModel } from "@/lib/ai/models";
import { QUALITY_CHECK_PROMPT } from "@/lib/ai/prompts/quality-check";
import type { OptimizationChange } from "@/types/optimization";

interface QualityCheckResult {
  passed: boolean;
  issues: string[];
  approvedChanges: number[];
  rejectedChanges: number[];
}

export async function qualityCheck(
  originalResume: string,
  optimizedResume: string,
  changes: OptimizationChange[]
): Promise<QualityCheckResult> {
  const model = await getModel();

  const prompt = PromptTemplate.fromTemplate(QUALITY_CHECK_PROMPT);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const result = await chain.invoke({
    originalResume,
    optimizedResume,
    changes: JSON.stringify(changes, null, 2),
  });

  const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned) as QualityCheckResult;
}
