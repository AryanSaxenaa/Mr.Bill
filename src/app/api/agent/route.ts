import { NextResponse } from "next/server";
import type OpenAI from "openai";
import { AGENT_SYSTEM_PROMPT } from "@/lib/agent-prompt";
import {
  createLlmClient,
  getLlmModel,
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
  if (!message && !body.confirmAction) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  if (!hasLiveLlmConfig()) {
    const demo = runDemoAgent({
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
    session = {
      ...session,
      lineItems:
        session.lineItems.length > 0 ? session.lineItems : PARSED_LINE_ITEMS,
    };
    const { session: s1, result } = executeAgentTool(
      "send_rfq",
      {
        request_id: session.requestId,
        supplier_ids: ["cairo-dairy", "bean-barrel"],
        line_items: session.lineItems,
        delivery_branch: session.deliveryBranch,
        needed_by: session.neededBy,
      },
      session,
      inventory,
    );
    session = s1;
    toolTrace.push({ name: result.name, summary: result.summary });

    const { session: s2, result: cmp } = executeAgentTool(
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

    const { session: s3, result: rec } = executeAgentTool(
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
      assistantMessage: `${rec.summary}\n\nSide-by-side comparison is ready below.`,
      session,
      toolTrace,
      ui: uiHintsFromSession(session),
      mode: "live",
    });
  }

  if (body.confirmAction === "approve") {
    const { session: s1, result } = executeAgentTool(
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
  const provider = resolveLlmProvider()!;
  const model = getLlmModel(provider);
  const openai = createLlmClient();

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

  while (rounds < MAX_TOOL_ROUNDS) {
    rounds += 1;
    const completion = await openai.chat.completions.create({
      model,
      messages,
      tools: OPENAI_TOOL_DEFINITIONS,
      tool_choice: "auto",
    });

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
          "I have the line items ready — please confirm in the UI or reply “confirm” before I send RFQs to suppliers.";
        continue;
      }

      const { session: newSession, result } = executeAgentTool(
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
    }

    if (toolCalls.length > 0 && !assistantText) {
      const followUp = await openai.chat.completions.create({
        model,
        messages,
      });
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
    const { session: s1, result } = executeAgentTool(
      "send_rfq",
      {
        request_id: session.requestId,
        supplier_ids: ["cairo-dairy", "bean-barrel"],
        line_items: session.lineItems,
        delivery_branch: session.deliveryBranch,
        needed_by: session.neededBy,
      },
      session,
      inventory,
    );
    session = s1;
    toolTrace.push({ name: result.name, summary: result.summary });

    const { session: s2, result: cmp } = executeAgentTool(
      "compare_quotes",
      { request_id: session.requestId, quote_ids: session.quoteIds },
      session,
      inventory,
    );
    session = s2;
    toolTrace.push({ name: cmp.name, summary: cmp.summary });

    const { session: s3, result: rec } = executeAgentTool(
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
    assistantText = `${assistantText}\n\n${rec.summary}`.trim();
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
  });
}
