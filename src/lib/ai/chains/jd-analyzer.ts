import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getModel } from "@/lib/ai/models";
import { JD_ANALYSIS_PROMPT } from "@/lib/ai/prompts/jd-analysis";
import type { JDAnalysis } from "@/types/jd";

export async function analyzeJD(jobDescription: string): Promise<JDAnalysis> {
  const model = await getModel();

  const prompt = PromptTemplate.fromTemplate(JD_ANALYSIS_PROMPT);
  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  const result = await chain.invoke({ jobDescription });

  const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned) as JDAnalysis;
}
