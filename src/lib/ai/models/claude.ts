import { ChatAnthropic } from "@langchain/anthropic";
import { AI_CONFIG } from "@/lib/ai/config";

export function createClaudeModel(): ChatAnthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  return new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: AI_CONFIG.claude.model,
    maxTokens: AI_CONFIG.claude.maxTokens,
    temperature: AI_CONFIG.claude.temperature,
  });
}
