import OpenAI from "openai";

export type LlmProvider = "openrouter" | "deepseek" | "openai";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

function readExplicitProvider(): LlmProvider | undefined {
  const raw = process.env.LLM_PROVIDER?.trim().toLowerCase();
  if (raw === "openrouter" || raw === "deepseek" || raw === "openai") {
    return raw;
  }
  return undefined;
}

export function getLlmApiKey(provider: LlmProvider): string | undefined {
  switch (provider) {
    case "openrouter":
      return process.env.OPENROUTER_API_KEY?.trim() || undefined;
    case "deepseek":
      return process.env.DEEPSEEK_API_KEY?.trim() || undefined;
    case "openai":
      return process.env.OPENAI_API_KEY?.trim() || undefined;
  }
}

export function getLlmModel(provider: LlmProvider): string {
  switch (provider) {
    case "openrouter":
      return process.env.OPENROUTER_MODEL ?? "deepseek/deepseek-chat";
    case "deepseek":
      return process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
    case "openai":
      return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  }
}

/** Picks provider from LLM_PROVIDER or first configured key (OpenRouter → DeepSeek → OpenAI). */
export function resolveLlmProvider(): LlmProvider | null {
  const explicit = readExplicitProvider();
  if (explicit) {
    return getLlmApiKey(explicit) ? explicit : null;
  }
  if (process.env.OPENROUTER_API_KEY?.trim()) return "openrouter";
  if (process.env.DEEPSEEK_API_KEY?.trim()) return "deepseek";
  if (process.env.OPENAI_API_KEY?.trim()) return "openai";
  return null;
}

export function hasLiveLlmConfig(): boolean {
  return resolveLlmProvider() !== null;
}

export function createLlmClient(): OpenAI {
  const provider = resolveLlmProvider();
  if (!provider) {
    throw new Error("No LLM provider configured");
  }
  const apiKey = getLlmApiKey(provider);
  if (!apiKey) {
    throw new Error(`Missing API key for provider: ${provider}`);
  }

  if (provider === "openrouter") {
    const defaultHeaders: Record<string, string> = {};
    const referer =
      process.env.OPENROUTER_HTTP_REFERER?.trim() ||
      process.env.NEXT_PUBLIC_APP_URL?.trim();
    const title = process.env.OPENROUTER_APP_TITLE?.trim() ?? "Mr.Bill";
    if (referer) {
      defaultHeaders["HTTP-Referer"] = referer;
    }
    if (title) {
      defaultHeaders["X-Title"] = title;
    }
    return new OpenAI({
      apiKey,
      baseURL: OPENROUTER_BASE_URL,
      defaultHeaders:
        Object.keys(defaultHeaders).length > 0 ? defaultHeaders : undefined,
    });
  }

  if (provider === "deepseek") {
    return new OpenAI({
      apiKey,
      baseURL: DEEPSEEK_BASE_URL,
    });
  }

  return new OpenAI({ apiKey });
}

export function getLlmPublicConfig(): {
  liveAgent: boolean;
  provider: LlmProvider | null;
  model: string | null;
} {
  const provider = resolveLlmProvider();
  if (!provider) {
    return { liveAgent: false, provider: null, model: null };
  }
  return {
    liveAgent: true,
    provider,
    model: getLlmModel(provider),
  };
}
