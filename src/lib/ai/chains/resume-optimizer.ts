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

  const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned) as OptimizationOutput;
}
