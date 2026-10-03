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

export function createLlmClientForProvider(provider: LlmProvider): OpenAI {
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

export function createLlmClient(): OpenAI {
  const provider = resolveLlmProvider();
  if (!provider) {
    throw new Error("No LLM provider configured");
  }
  return createLlmClientForProvider(provider);
}

function isRetryableLlmError(err: unknown): boolean {
  if (!(err instanceof Error)) return true;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("401") ||
    msg.includes("403") ||
    msg.includes("429") ||
    msg.includes("unauthorized") ||
    msg.includes("invalid") ||
    msg.includes("api key") ||
    msg.includes("fetch") ||
    msg.includes("network") ||
    msg.includes("timeout")
  );
}

export type ChatCompletionParams = Omit<
  OpenAI.Chat.ChatCompletionCreateParamsNonStreaming,
  "model"
> & { model?: string };

export async function chatCompletionWithResilience(
  params: ChatCompletionParams,
): Promise<{
  completion: OpenAI.Chat.ChatCompletion;
  provider: LlmProvider;
  retriedFrom?: LlmProvider;
}> {
  const primary = resolveLlmProvider();
  if (!primary) {
    throw new Error("No LLM provider configured");
  }

  const primaryModel = getLlmModel(primary);
  const primaryClient = createLlmClientForProvider(primary);

  try {
    const completion = await primaryClient.chat.completions.create({
      ...params,
      model: params.model ?? primaryModel,
    });
    return { completion, provider: primary };
  } catch (primaryErr) {
    const deepseekKey = process.env.DEEPSEEK_API_KEY?.trim();
    if (
      primary === "openrouter" &&
      deepseekKey &&
      isRetryableLlmError(primaryErr)
    ) {
      console.warn(
        "OpenRouter chat failed; retrying with DeepSeek:",
        primaryErr instanceof Error ? primaryErr.message : primaryErr,
      );
      const fallbackClient = createLlmClientForProvider("deepseek");
      const completion = await fallbackClient.chat.completions.create({
        ...params,
        model: getLlmModel("deepseek"),
      });
      return { completion, provider: "deepseek", retriedFrom: "openrouter" };
    }
    throw primaryErr;
  }
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
