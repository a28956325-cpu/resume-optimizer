import { ChatOpenAI } from "@langchain/openai";
import { AI_CONFIG } from "@/lib/ai/config";

export function createOpenAIModel(): ChatOpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  return new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: AI_CONFIG.openai.model,
    maxTokens: AI_CONFIG.openai.maxTokens,
    temperature: AI_CONFIG.openai.temperature,
  });
}
