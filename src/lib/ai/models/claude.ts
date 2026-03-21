import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage, type BaseMessage } from "@langchain/core/messages";
import type { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import type { ChatResult } from "@langchain/core/outputs";
import Anthropic from "@anthropic-ai/sdk";
import { AI_CONFIG } from "@/lib/ai/config";

/**
 * Thin wrapper around the official Anthropic SDK that implements
 * LangChain's BaseChatModel interface.
 *
 * This avoids the @langchain/anthropic ChatAnthropic class which
 * sends `top_p: -1` by default — rejected by Claude Sonnet 4.6+.
 */
class ClaudeDirectModel extends BaseChatModel {
  private client: Anthropic;

  constructor() {
    super({});
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }

  _llmType(): string {
    return "anthropic-direct";
  }

  async _generate(
    messages: BaseMessage[],
    _options?: this["ParsedCallOptions"],
    _runManager?: CallbackManagerForLLMRun
  ): Promise<ChatResult> {
    const anthropicMessages = messages.map((msg) => ({
      role: (msg._getType() === "human" ? "user" : "assistant") as
        | "user"
        | "assistant",
      content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
    }));

    const response = await this.client.messages.create({
      model: AI_CONFIG.claude.model,
      max_tokens: AI_CONFIG.claude.maxTokens,
      temperature: AI_CONFIG.claude.temperature,
      messages: anthropicMessages,
    });

    const text =
      response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("") || "";

    return {
      generations: [
        {
          text,
          message: new AIMessage(text),
        },
      ],
    };
  }
}

export function createClaudeModel(): BaseChatModel {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  return new ClaudeDirectModel();
}