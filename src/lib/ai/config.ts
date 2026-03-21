export const AI_CONFIG = {
  claude: {
    model: "claude-opus-4-5-20250514",
    maxTokens: 4096,
    temperature: 0.3,
  },
  openai: {
    model: "gpt-4o-mini",
    maxTokens: 4096,
    temperature: 0.3,
  },
};

export function isDemoMode(): boolean {
  return (
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY)
  );
}

export function getAvailableProvider(): "claude" | "openai" | "demo" {
  if (process.env.ANTHROPIC_API_KEY) return "claude";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "demo";
}