import { NextResponse } from "next/server";
import type OpenAI from "openai";
import { AGENT_SYSTEM_PROMPT } from "@/lib/agent-prompt";
import {
  chatCompletionWithResilience,
  hasLiveLlmConfig,
  resolveLlmProvider,
} from "@/lib/llm-client";
import { OPENAI_TOOL_DEFINITIONS } from "@/lib/agent-openai-schemas";
import {
  executeAgentTool,
  type ToolName,
} from "@/lib/agent-executor";
import {
  DEFAULT_SESSION,
  uiHintsFromSession,
  type AgentSession,
} from "@/lib/agent-session";
import { PARSED_LINE_ITEMS } from "@/lib/mock-data";
import type { InventoryDelta } from "@/lib/agent-tools";
import { runDemoAgent } from "@/lib/demo-agent";
import { hasAgentMailConfig } from "@/lib/agentmail";

const MAX_TOOL_ROUNDS = 8;

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface AgentRequestBody {
  message: string;
  history?: ChatTurn[];
  session?: AgentSession;
  inventory?: { branchId: string; sku: string; qty: number }[];
  confirmAction?: "send_rfq" | "approve";
  parseQuote?: { supplierId: string; rawText: string };
}

function intakeHeuristic(message: string, session: AgentSession): AgentSession {
  const lower = message.toLowerCase();
  if (
    lower.includes("oat") ||
    lower.includes("maadi") ||
    lower.includes("espresso") ||
    lower.includes("cup")
  ) {
    return {
      ...session,
      lineItems: PARSED_LINE_ITEMS,
      status: "awaiting_confirm",
      neededBy: lower.includes("friday") ? "Friday" : session.neededBy,
      deliveryBranch: lower.includes("maadi") ? "Maadi" : session.deliveryBranch,
    };
  }
  return session;
}

function defaultSupplierIds(session: AgentSession): string[] {
  if (session.selectedRfqSupplierIds?.length) {
    return session.selectedRfqSupplierIds;
  }
  return ["cairo-dairy", "bean-barrel"];
}

async function runSendRfqConfirm(
  sessionIn: AgentSession,
  inventory: { branchId: string; sku: string; qty: number }[],
): Promise<{
  session: AgentSession;
  toolTrace: { name: string; summary: string }[];
  assistantMessage: string;
}> {
  const toolTrace: { name: string; summary: string }[] = [];
  let session: AgentSession = {
    ...sessionIn,
    lineItems:
      sessionIn.lineItems.length > 0 ? sessionIn.lineItems : PARSED_LINE_ITEMS,
  };

  const { session: s1, result } = await executeAgentTool(
    "send_rfq",
    {
      request_id: session.requestId,
      supplier_ids: defaultSupplierIds(session),
      line_items: session.lineItems,
      delivery_branch: session.deliveryBranch,
      needed_by: session.neededBy,
    },
    session,
    inventory,
  );
  session = s1;
  toolTrace.push({ name: result.name, summary: result.summary });

  if (session.quoteIds.length >= 2) {
    const { session: s2, result: cmp } = await executeAgentTool(
      "compare_quotes",
      {
        request_id: session.requestId,
        quote_ids: session.quoteIds,
      },
      session,
      inventory,
    );
    session = s2;
    toolTrace.push({ name: cmp.name, summary: cmp.summary });

    const { session: s3, result: rec } = await executeAgentTool(
      "recommend",
      {
        request_id: session.requestId,
        comparison_id: session.comparisonId,
      },
      session,
      inventory,
    );
    session = s3;
    toolTrace.push({ name: rec.name, summary: rec.summary });

    return {
      session,
      toolTrace,
      assistantMessage: `${rec.summary}\n\nSide-by-side comparison is ready below.`,
    };
  }

  const waiting = hasAgentMailConfig()
    ? "RFQs sent from your quote inbox. Catalog quotes are attached so you can compare now."
    : "Waiting for supplier quotes.";

  return {
    session,
    toolTrace,
    assistantMessage: `${result.summary}\n\n${waiting}`,
  };
}

function isConfirmMessage(message: string): boolean {
  const t = message.toLowerCase().trim();
  return (
    t === "yes" ||
    t.includes("confirm") ||
    t.includes("send rfq") ||
    t.includes("send it") ||
    t.includes("looks good") ||
    t.includes("approve")
  );
}

export async function POST(req: Request) {
  let body: AgentRequestBody;
  try {
    body = (await req.json()) as AgentRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message && !body.confirmAction && !body.parseQuote) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  if (body.parseQuote?.rawText?.trim()) {
    try {
      let session: AgentSession = body.session ?? { ...DEFAULT_SESSION };
      const inventory = body.inventory ?? [];
      const toolTrace: { name: string; summary: string }[] = [];
      const supplierId = body.parseQuote.supplierId || "cairo-dairy";
      const rawText = body.parseQuote.rawText.trim();

      const { session: s1, result: parsed } = await executeAgentTool(
        "parse_quote_reply",
        {
          rfq_id: session.rfqId,
          supplier_id: supplierId,
          raw_text: rawText,
        },
        session,
        inventory,
      );
      session = s1;
      toolTrace.push({ name: parsed.name, summary: parsed.summary });

      if (session.quoteIds.length >= 2) {
        const { session: s2, result: cmp } = await executeAgentTool(
          "compare_quotes",
          {
            request_id: session.requestId,
            quote_ids: session.quoteIds,
          },
          session,
          inventory,
        );
        session = s2;
        toolTrace.push({ name: cmp.name, summary: cmp.summary });

        const { session: s3, result: rec } = await executeAgentTool(
          "recommend",
          {
            request_id: session.requestId,
            comparison_id: session.comparisonId,
          },
          session,
          inventory,
        );
        session = s3;
        toolTrace.push({ name: rec.name, summary: rec.summary });

        return NextResponse.json({
          assistantMessage: `Parsed reply from ${supplierId}. ${rec.summary}`,
          session,
          toolTrace,
          ui: uiHintsFromSession(session),
          mode: hasLiveLlmConfig() ? "live" : "demo",
        });
      }

      return NextResponse.json({
        assistantMessage: parsed.summary,
        session,
        toolTrace,
        ui: uiHintsFromSession(session),
        mode: hasLiveLlmConfig() ? "live" : "demo",
      });
    } catch (err) {
      console.error("parseQuote failed:", err);
      return NextResponse.json({
        assistantMessage:
          "Could not parse that reply. Try the Cairo Dairy or Bean & Barrel sample text.",
        session: body.session ?? { ...DEFAULT_SESSION },
        toolTrace: [],
        ui: uiHintsFromSession(body.session ?? { ...DEFAULT_SESSION }),
        mode: hasLiveLlmConfig() ? "live" : "demo",
      });
    }
  }

  if (!hasLiveLlmConfig()) {
    const demo = await runDemoAgent({
      message: message ?? "",
      history: body.history,
      session: body.session,
      inventory: body.inventory,
      confirmAction: body.confirmAction,
    });
    return NextResponse.json(demo);
  }

  let session: AgentSession = body.session ?? { ...DEFAULT_SESSION };
  const inventory = body.inventory ?? [];
  const toolTrace: { name: string; summary: string }[] = [];
  let inventoryDeltas: InventoryDelta[] | undefined;

  if (body.confirmAction === "send_rfq") {
    try {
      const pipeline = await runSendRfqConfirm(
        body.session ?? { ...DEFAULT_SESSION },
        inventory,
      );
      return NextResponse.json({
        assistantMessage: pipeline.assistantMessage,
        session: pipeline.session,
        toolTrace: pipeline.toolTrace,
        ui: uiHintsFromSession(pipeline.session),
        mode: hasLiveLlmConfig() ? "live" : "demo",
      });
    } catch (err) {
      console.error("confirmAction send_rfq failed:", err);
      try {
        const demo = await runDemoAgent({
          message: message ?? "",
          history: body.history,
          session: body.session,
          inventory: body.inventory,
          confirmAction: "send_rfq",
        });
        return NextResponse.json({
          ...demo,
          mailFallback: true,
          mailFallbackReason:
            err instanceof Error ? err.message : "RFQ send failed",
        });
      } catch (demoErr) {
        console.error("send_rfq demo fallback failed:", demoErr);
        const fallbackSession: AgentSession = {
          ...(body.session ?? { ...DEFAULT_SESSION }),
          lineItems:
            body.session && body.session.lineItems.length > 0
              ? body.session.lineItems
              : PARSED_LINE_ITEMS,
        };
        try {
          const recovered = await runSendRfqConfirm(fallbackSession, inventory);
          return NextResponse.json({
            assistantMessage: recovered.assistantMessage,
            session: recovered.session,
            toolTrace: recovered.toolTrace,
            ui: uiHintsFromSession(recovered.session),
            mode: "demo",
            mailFallback: true,
            mailFallbackReason:
              err instanceof Error ? err.message : "RFQ send failed",
          });
        } catch (lastErr) {
          console.error("send_rfq last-resort failed:", lastErr);
          return NextResponse.json({
            assistantMessage:
              "RFQ send hit an error. Simulated Cairo Dairy and Bean & Barrel quotes are ready so you can compare.",
            session: fallbackSession,
            toolTrace: [],
            ui: uiHintsFromSession(fallbackSession),
            mode: "demo",
            mailFallback: true,
            mailFallbackReason:
              err instanceof Error ? err.message : "RFQ send failed",
          });
        }
      }
    }
  }

  if (body.confirmAction === "approve") {
    const { session: s1, result } = await executeAgentTool(
      "update_inventory",
      {
        request_id: session.requestId,
        recommendation_id: session.recommendation?.recommendationId,
        approved_by: "Layla",
      },
      session,
      inventory,
    );
    session = s1;
    toolTrace.push({ name: result.name, summary: result.summary });
    const out = result.output as { inventoryDeltas: InventoryDelta[] };
    inventoryDeltas = out.inventoryDeltas;

    return NextResponse.json({
      assistantMessage: result.summary,
      session,
      toolTrace,
      inventoryDeltas,
      ui: uiHintsFromSession(session),
      mode: "live",
    });
  }

  session = intakeHeuristic(message ?? "", session);

  const history = body.history ?? [];

  try {
    resolveLlmProvider();
  } catch (err) {
    console.error("Agent LLM client setup failed:", err);
    const demo = await runDemoAgent({
      message: message ?? "",
      history: body.history,
      session: body.session,
      inventory: body.inventory,
    });
    return NextResponse.json({ ...demo, llmFallback: true, llmFallbackReason: "no_provider" });
  }

  const sessionContext = `Current session JSON: ${JSON.stringify({
    requestId: session.requestId,
    lineItems: session.lineItems,
    rfqId: session.rfqId,
    quoteIds: session.quoteIds,
    comparisonId: session.comparisonId,
    recommendation: session.recommendation
      ? {
          recommendationId: session.recommendation.recommendationId,
          summary: session.recommendation.summary,
        }
      : undefined,
    status: session.status,
    neededBy: session.neededBy,
    deliveryBranch: session.deliveryBranch,
    discoveredSuppliers: session.discoveredSuppliers,
    selectedRfqSupplierIds: session.selectedRfqSupplierIds,
  })}`;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: `${AGENT_SYSTEM_PROMPT}\n\n${sessionContext}` },
    ...history.map((h) => ({
      role: h.role,
      content: h.content,
    })),
    { role: "user", content: message ?? "" },
  ];

  let assistantText = "";
  let rounds = 0;
  let llmProviderUsed: ReturnType<typeof resolveLlmProvider> | undefined;
  let llmRetriedFrom: ReturnType<typeof resolveLlmProvider> | undefined;

  try {
    while (rounds < MAX_TOOL_ROUNDS) {
      rounds += 1;
      const { completion, provider, retriedFrom } =
        await chatCompletionWithResilience({
          messages,
          tools: OPENAI_TOOL_DEFINITIONS,
          tool_choice: "auto",
        });
      llmProviderUsed = provider;
      if (retriedFrom) {
        llmRetriedFrom = retriedFrom;
      }

      const choice = completion.choices[0]?.message;
      if (!choice) {
        break;
      }

      if (choice.content) {
        assistantText = choice.content;
      }

      const toolCalls = choice.tool_calls;
      if (!toolCalls?.length) {
        messages.push({ role: "assistant", content: choice.content ?? "" });
        break;
      }

      messages.push({
        role: "assistant",
        content: choice.content ?? null,
        tool_calls: toolCalls,
      });

      for (const call of toolCalls) {
        if (call.type !== "function") continue;
        const name = call.function.name as ToolName;
        let parsedArgs: Record<string, unknown> = {};
        try {
          parsedArgs = JSON.parse(call.function.arguments || "{}") as Record<
            string,
            unknown
          >;
        } catch {
          parsedArgs = {};
        }

        if (
          name === "send_rfq" &&
          session.status === "awaiting_confirm" &&
          !isConfirmMessage(message ?? "")
        ) {
          const blockResult = {
            error:
              "RFQ blocked: waiting for Layla to confirm line items in chat first.",
          };
          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify(blockResult),
          });
          assistantText =
            "I have the line items ready - please confirm in the UI or reply “confirm” before I send RFQs to suppliers.";
          continue;
        }

        try {
          const { session: newSession, result } = await executeAgentTool(
            name,
            parsedArgs,
            session,
            inventory,
          );
          session = newSession;
          toolTrace.push({ name: result.name, summary: result.summary });

          if (name === "update_inventory") {
            const out = result.output as { inventoryDeltas: InventoryDelta[] };
            inventoryDeltas = out.inventoryDeltas;
          }

          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify(result.output),
          });
        } catch (toolErr) {
          console.error("Agent tool failed:", name, toolErr);
          messages.push({
            role: "tool",
            tool_call_id: call.id,
            content: JSON.stringify({
              error:
                toolErr instanceof Error ? toolErr.message : "Tool failed",
            }),
          });
        }
      }

      if (toolCalls.length > 0 && !assistantText) {
        const { completion: followUp, provider: followProvider, retriedFrom } =
          await chatCompletionWithResilience({ messages });
        llmProviderUsed = followProvider;
        if (retriedFrom) {
          llmRetriedFrom = retriedFrom;
        }
        assistantText =
          followUp.choices[0]?.message?.content ??
          toolTrace.map((t) => t.summary).join("\n");
        messages.push({ role: "assistant", content: assistantText });
        break;
      }
    }

    if (
      session.lineItems.length > 0 &&
      !session.rfqId &&
      session.status === "awaiting_confirm" &&
      isConfirmMessage(message ?? "")
    ) {
      try {
        const pipeline = await runSendRfqConfirm(session, inventory);
        session = pipeline.session;
        toolTrace.push(...pipeline.toolTrace);
        assistantText = `${assistantText}\n\n${pipeline.assistantMessage}`.trim();
      } catch (err) {
        console.error("LLM-path send_rfq failed:", err);
        const demo = await runDemoAgent({
          message: message ?? "",
          history: body.history,
          session,
          inventory,
          confirmAction: "send_rfq",
        });
        session = demo.session;
        toolTrace.push(...demo.toolTrace);
        assistantText = `${assistantText}\n\n${demo.assistantMessage}`.trim();
      }
    }

    return NextResponse.json({
      assistantMessage:
        assistantText ||
        toolTrace.map((t) => t.summary).join("\n") ||
        "Done.",
      session,
      toolTrace,
      inventoryDeltas,
      ui: uiHintsFromSession(session),
      mode: "live",
      llmProvider: llmProviderUsed,
      llmRetriedFrom: llmRetriedFrom ?? undefined,
    });
  } catch (err) {
    console.error("Agent LLM request failed:", err);
    const demo = await runDemoAgent({
      message: message ?? "",
      history: body.history,
      session: body.session,
      inventory: body.inventory,
    });
    return NextResponse.json({
      ...demo,
      llmFallback: true,
      llmFallbackReason:
        err instanceof Error ? err.message : "LLM request failed",
    });
  }
}
