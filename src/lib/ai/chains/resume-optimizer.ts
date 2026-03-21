import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getModel } from "@/lib/ai/models";
import { RESUME_OPTIMIZATION_PROMPT } from "@/lib/ai/prompts/resume-optimization";
import type { OptimizationChange } from "@/types/optimization";

interface OptimizationOutput {
  optimizedResume: string;
  changes: OptimizationChange[];
  summary: string;
}

function repairAndParseJSON(raw: string): OptimizationOutput {
  // Remove markdown fences if present
  let cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();

  // First attempt: direct parse
  try {
    return JSON.parse(cleaned) as OptimizationOutput;
  } catch {
    // Second attempt: extract JSON object via regex
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      let extracted = match[0];
      // Strip trailing commas before ] or }
      extracted = extracted.replace(/,(\s*[}\]])/g, "$1");
      try {
        return JSON.parse(extracted) as OptimizationOutput;
      } catch {
        // Fall through to throw below
      }
    }
    throw new Error("Could not parse optimization response as JSON");
  }
}

function validateOutput(output: OptimizationOutput): void {
  if (
    typeof output.optimizedResume !== "string" ||
    !Array.isArray(output.changes) ||
    typeof output.summary !== "string"
  ) {
    throw new Error(
      "Optimization response is missing required fields (optimizedResume, changes, summary)"
    );
  }
}

export async function optimizeResume(
  resumeText: string,
  jobDescription: string,
  keywords: string[]
): Promise<OptimizationOutput> {
  const model = await getModel();

  const prompt = PromptTemplate.fromTemplate(RESUME_OPTIMIZATION_PROMPT);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const result = await chain.invoke({
    resumeText,
    jobDescription,
    keywords: keywords.join(", "),
  });

  const output = repairAndParseJSON(result);
  validateOutput(output);
  return output;
}
