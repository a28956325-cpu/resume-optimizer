import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { getAvailableProvider } from "@/lib/ai/config";

export async function getModel(): Promise<BaseChatModel> {
  const provider = getAvailableProvider();

  if (provider === "claude") {
    const { createClaudeModel } = await import("@/lib/ai/models/claude");
    return createClaudeModel();
  }

  if (provider === "openai") {
    const { createOpenAIModel } = await import("@/lib/ai/models/openai");
    return createOpenAIModel();
  }

  throw new Error("No AI provider available. Please set API keys.");
}
